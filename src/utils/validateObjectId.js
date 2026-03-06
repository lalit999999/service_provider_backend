import mongoose from 'mongoose';

export const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const validateObjectId = (id, fieldName = 'ID') => {
    if (!isValidObjectId(id)) {
        return {
            isValid: false,
            message: `Invalid ${fieldName} format`,
        };
    }
    return { isValid: true };
};
