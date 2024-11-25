const { httpStatus, httpCodes } = require('../utils/serverStatus');

/**
 * Base class for all server-related errors
 * Provides common error handling functionality with HTTP status codes
 */
class ServerError extends Error {
    constructor(
        message = 'Server Error',
        title = httpStatus[httpCodes.INTERNAL_SERVER_ERROR] || 'Unknown Status'
    ) {
        super(message);
        this.status = 500;
        this.title = title;
        this.description = 'The server encountered an unexpected condition that prevented it from fulfilling the request';
    }
}

/**
 * Error for malformed requests that the server cannot process
 * HTTP Status Code: 400
 */
class BadRequestError extends ServerError {
    constructor(
        message = 'Bad Request',
        title = httpStatus[httpCodes.BAD_REQUEST] || 'Unknown Status'
    ) {
        super(message);
        this.status = 400;
        this.title = title;
        this.description = 'The request could not be understood by the server due to malformed syntax';
    }
}

/**
 * Error for requests requiring authentication
 * HTTP Status Code: 401
 */
class UnauthorizedError extends ServerError {
    constructor(
        message = 'Unauthorized',
        title = httpStatus[httpCodes.UNAUTHORIZED] || 'Unknown Status'
    ) {
        super(message);
        this.status = 401;
        this.title = title;
        this.description = 'The request requires user authentication';
    }
}

/**
 * Error for authenticated requests without proper authorization
 * HTTP Status Code: 403
 */
class ForbiddenError extends ServerError {
    constructor(
        message = 'Forbidden',
        title = httpStatus[httpCodes.FORBIDDEN] || 'Unknown Status'
    ) {
        super(message);
        this.status = 403;
        this.title = title;
        this.description = 'You do not have permission to access this resource';
    }
}

/**
 * Error for requests to non-existent resources
 * HTTP Status Code: 404
 */
class NotFoundError extends ServerError {
    constructor(
        message = 'Not Found',
        title = httpStatus[httpCodes.NOT_FOUND] || 'Unknown Status'
    ) {
        super(message);
        this.status = 404;
        this.title = title;
        this.description = 'The requested resource could not be found on this server';
    }
}

/**
 * Error for unexpected server conditions
 * HTTP Status Code: 500
 */
class InternalServerError extends ServerError {
    constructor(
        message = 'Internal Server Error',
        title = httpStatus[httpCodes.INTERNAL_SERVER_ERROR] || 'Unknown Status'
    ) {
        super(message);
        this.status = 500;
        this.title = title;
        this.description = 'The server encountered an unexpected condition that prevented it from fulfilling the request';
    }
}

/**
 * Error for invalid responses from upstream servers
 * HTTP Status Code: 502
 */
class BadGatewayError extends ServerError {
    constructor(
        message = 'Bad Gateway',
        title = httpStatus[httpCodes.BAD_GATEWAY] || 'Unknown Status'
    ) {
        super(message);
        this.status = 502;
        this.title = title;
        this.description = 'The server received an invalid response from the upstream server';
    }
}

/**
 * Error for temporary server unavailability
 * HTTP Status Code: 503
 */
class ServiceUnavailableError extends ServerError {
    constructor(
        message = 'Service Unavailable',
        title = httpStatus[httpCodes.SERVICE_UNAVAILABLE] || 'Unknown Status'
    ) {
        super(message);
        this.status = 503;
        this.title = title;
        this.description = 'The server is currently unable to handle the request due to temporary overloading or maintenance';
    }
}

/**
 * Error for upstream server timeout
 * HTTP Status Code: 504
 */
class GatewayTimeoutError extends ServerError {
    constructor(
        message = 'Gateway Timeout',
        title = httpStatus[httpCodes.GATEWAY_TIMEOUT] || 'Unknown Status'
    ) {
        super(message);
        this.status = 504;
        this.title = title;
        this.description = 'The upstream server failed to send a request in the time allowed';
    }
}

module.exports = {
    ServerError,
    BadRequestError,
    UnauthorizedError, 
    ForbiddenError,
    NotFoundError,
    InternalServerError,
    BadGatewayError,
    ServiceUnavailableError,
    GatewayTimeoutError
};
