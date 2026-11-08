#!/usr/bin/env dotnet

/*
 * Viết method nhận List<CrewBooking>, trả về các cặp booking trùng đêm của cùng một crew (CheckOut là ngày rời đi, không tính là một đêm ở).
 * Xong thì dán code vào đây, kèm: độ phức tạp, và các test case bạn sẽ thử.
 */

IEnumerable<DuplicateBooking> GetDuplicatedBookings(List<CrewBooking> bookings)
{
    List<IGrouping<int, CrewBooking>> bookingsByCrews = bookings.GroupBy(b => b.CrewId).ToList();

    foreach (IGrouping<int, CrewBooking> bookingsByCrew in bookingsByCrews)
    {
        List<CrewBooking> bookingsByCrewValue = bookingsByCrew.ToList();

        for (var i = 1; i < bookingsByCrewValue.Count; i++)
        {
            bool isOverlapping = IsOverlapping(bookingsByCrewValue[i - 1], bookingsByCrewValue[i]);

            if (isOverlapping)
            {
                yield return new DuplicateBooking(
                    bookingsByCrewValue[i].CrewId,
                    bookingsByCrewValue[i - 1],
                    bookingsByCrewValue[i]
                );
            }
        }
    }

    yield break;

    bool IsOverlapping(CrewBooking booking1, CrewBooking booking2)
    {
        return booking2.CheckIn < booking1.CheckOut || booking2.CheckOut < booking1.CheckIn;
    }
}

List<CrewBooking> data =
[
    new(1, 1, 1, new DateOnly(2026, 11, 10), new DateOnly(2026, 11, 11)),
    new(2, 1, 1, new DateOnly(2026, 11, 10), new DateOnly(2026, 11, 12)),
    new(3, 2, 1, new DateOnly(2026, 11, 10), new DateOnly(2026, 11, 11)),
    new(4, 3, 1, new DateOnly(2026, 11, 10), new DateOnly(2026, 11, 11))
];

IEnumerable<DuplicateBooking> r = GetDuplicatedBookings(data);

internal record CrewBooking(int Id, int CrewId, int HotelId, DateOnly CheckIn, DateOnly CheckOut);

internal record DuplicateBooking(int CrewId, CrewBooking Booking1, CrewBooking Booking2);