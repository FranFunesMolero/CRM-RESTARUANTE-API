const { httpStatus } = require('../utils/serverStatus');

class ClientError extends Error {
    constructor(message = 'Client Error') {
        super(message);
    }
}

class BadRequestError extends ClientError {
    constructor(
        message = 'The request could not be understood by the server due to malformed syntax',
        title = httpStatus[400] || 'Unknown Status'
    ) {
        super(message);
        this.status = 400;
        this.title = title;
        this.message = message;
    }
}

class UnauthorizedError extends ClientError {
    constructor(
        message = 'The request requires user authentication',
        title = httpStatus[401] || 'Unknown Status'
    ) {
        super(message);
        this.status = 401;
        this.title = title;
        this.message = message;
    }
}

class ForbiddenError extends ClientError {
    constructor(
        message = 'You do not have permission to access this resource',
        title = httpStatus[403] || 'Unknown Status'
    ) {
        super(message);
        this.status = 403;
        this.title = title;
        this.message = 'You do not have permission to access this resource';
    }
}

class NotFoundError extends ClientError {
    constructor(
        message = 'The requested resource could not be found on this server',
        title = httpStatus[404] || 'Unknown Status'
    ) {
        super(message);
        this.status = 404;
        this.title = title;
        this.message = message;
    }
}

class ConflictError extends ClientError {
    constructor(
        message = 'The user with the provided email already exists',
        title = httpStatus[409] || 'Unknown Status'
    ) {
        super(message);
        this.status = 409;
        this.title = title;
        this.message = message;

    }
}

class LengthError extends ClientError {
    constructor(
        message = 'The string length is invalid',
        title = httpStatus[400] || 'Unknown Status'
    ) {
        super(message);
        this.status = 400;
        this.title = title;
        this.message = message;
    }
}

class TooManyRequestsError extends ClientError {
    constructor(
        message = 'Too many requests. Please try again later.',
        title = httpStatus[429] || 'Unknown Status'
    ) {
        super(message);
        this.status = 429;
        this.title = title;
        this.message = message;
    }
}

module.exports = {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    LengthError,
    TooManyRequestsError
};
