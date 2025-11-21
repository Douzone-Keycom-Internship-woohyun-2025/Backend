export class NotFoundError extends Error {
  constructor(message = "리소스를 찾을 수 없음") {
    super(message);
    this.name = "NotFoundError";
  }
}
