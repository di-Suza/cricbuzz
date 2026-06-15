class AsyncHandler {
  static wrap(handler) {
    return function wrappedAsyncHandler(req, res, next) {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  }
}

const asyncHandler = AsyncHandler.wrap;

export { AsyncHandler };
export default asyncHandler;
