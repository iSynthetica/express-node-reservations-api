export interface ReservationRow {
  id: string;
  amenity_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  date: string;
}

export interface Reservation {
  id: number;
  amenityId: number;
  userId: number;
  startTime: number;
  endTime: number;
  date: number;
}
