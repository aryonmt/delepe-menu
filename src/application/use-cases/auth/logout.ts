/**
 * Session end is cookie deletion in the server action (stateless JWT, docs/10).
 * The use-case exists so the container exposes every docs/04 auth contract.
 */
export class LogoutUseCase {
  async execute(): Promise<void> {
    return;
  }
}
