import { type Reservation } from './reservations.types';
import { calcDuration, minutesToTime, timestampToDateString } from '../../shared/utils/date-time';
import { type AmenitiesRepositoryPort } from '../amenities';
import { type ReservationsRepositoryPort } from './reservations.repository.port';
import { type LoggerPort } from '../../shared/ports/logger.port';

interface AmenityReservationView {
  id: number;
  userId: number;
  startTime: string;
  duration: number;
  amenityName: string;
}

interface UserReservationView {
  id: number;
  amenityId: number;
  startTime: string;
  duration: number;
}

interface UserReservationsByDateView {
  date: string;
  reservations: UserReservationView[];
}

type AmenityReservationsResult =
  | { status: 'not_found' }
  | { status: 'ok'; data: AmenityReservationView[] };

interface ReservationsServiceDeps {
  reservationsRepo: ReservationsRepositoryPort;
  amenitiesRepo: AmenitiesRepositoryPort;
  logger: LoggerPort;
}

export function createReservationsService({
  reservationsRepo,
  amenitiesRepo,
  logger,
}: ReservationsServiceDeps) {
  return {
    async getAmenityReservations(
      amenityId: number,
      date: number,
    ): Promise<AmenityReservationsResult> {
      logger.debug({ amenityId, date }, 'Fetching amenity reservations');

      const amenity = await amenitiesRepo.findById(amenityId);
      if (!amenity) {
        logger.debug({ amenityId }, 'Amenity not found');
        return { status: 'not_found' };
      }

      const reservations = await reservationsRepo.findByAmenityAndDate(amenityId, date);

      return {
        status: 'ok',
        data: mapAmenityReservations(reservations, amenity.name),
      };
    },

    async getUserReservations(userId: number): Promise<UserReservationsByDateView[]> {
      logger.debug({ userId }, 'Fetching user reservations');

      const reservations = await reservationsRepo.findByUserId(userId);
      return groupUserReservationsByDate(reservations);
    },
  };
}

export type ReservationsService = ReturnType<typeof createReservationsService>;

export function mapAmenityReservations(
  reservations: readonly Reservation[],
  amenityName: string,
): AmenityReservationView[] {
  return [...reservations]
    .sort((a, b) => a.startTime - b.startTime)
    .map((reservation) => ({
      id: reservation.id,
      userId: reservation.userId,
      startTime: minutesToTime(reservation.startTime),
      duration: calcDuration(reservation.startTime, reservation.endTime),
      amenityName,
    }));
}

export function groupUserReservationsByDate(
  reservations: readonly Reservation[],
): UserReservationsByDateView[] {
  const grouped = new Map<number, Reservation[]>();
  reservations.forEach((reservation) => {
    const items = grouped.get(reservation.date) ?? [];
    items.push(reservation);
    grouped.set(reservation.date, items);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([date, items]) => ({
      date: timestampToDateString(date),
      reservations: [...items]
        .sort((a, b) => a.startTime - b.startTime)
        .map((reservation) => ({
          id: reservation.id,
          amenityId: reservation.amenityId,
          startTime: minutesToTime(reservation.startTime),
          duration: calcDuration(reservation.startTime, reservation.endTime),
        })),
    }));
}
