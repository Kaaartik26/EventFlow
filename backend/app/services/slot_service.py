from datetime import timedelta

def generate_slots(event, bookings):

    slots = []
    current_time = event.start_time

    while current_time < event.end_time:

        slot_end = current_time + timedelta(minutes=event.slot_duration)

        count = 0
        for booking in bookings:
            if booking.slot_start == current_time:
                count += 1

        available = event.max_capacity - count

        slots.append({
            "start": current_time,
            "end": slot_end,
            "available": available
        })
        current_time = slot_end
    return slots