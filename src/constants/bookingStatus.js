export const BOOKING_STATUS = {
    REQUESTED: 'Requested',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};

// Strict state transitions
export const isValidStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
        Requested: ['Accepted', 'Cancelled'],
        Accepted: ['Completed', 'Cancelled'],
        Rejected: [],
        Completed: [],
        Cancelled: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Get valid transitions for a given status
export const getValidTransitions = (currentStatus) => {
    const validTransitions = {
        Requested: ['Accepted', 'Cancelled'],
        Accepted: ['Completed', 'Cancelled'],
        Rejected: [],
        Completed: [],
        Cancelled: [],
    };

    return validTransitions[currentStatus] || [];
};

