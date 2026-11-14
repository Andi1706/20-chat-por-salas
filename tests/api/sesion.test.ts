import { beforeEach, describe, expect, it, vi } from "vitest";
import { tokenDe } from "../helpers";

const mocks = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
  createSessionCookie: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getAdminAuth: () => mocks,
  getDb: vi.fn(),
}));

import { POST } from "@/app/api/auth/sesion/route";

const URL_SESION = "http://localhost/api/auth/sesion";
const CUERPO = { idToken: "token-de-prueba-largo" };

function pedirSesion(cabeceras: Record<string, string>): Request {
  return new Request(URL_SESION, {
    method: "POST",
    headers: { "content-type": "application/json", ...cabeceras },
    body: JSON.stringify(CUERPO),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.verifyIdToken.mockResolvedValue(tokenDe("u1"));
  mocks.createSessionCookie.mockResolvedValue("cookie-firmada");
});

describe("POST /api/auth/sesion", () => {
  it("rechaza con 403 una petición sin Origin ni Authorization (CSRF)", async () => {
    const respuesta = await POST(pedirSesion({}), { params: Promise.resolve({}) });
    expect(respuesta.status).toBe(403);
  });

  it("rechaza con 403 un Origin de otro sitio", async () => {
    const respuesta = await POST(pedirSesion({ origin: "https://sitio-malo.com" }), {
      params: Promise.resolve({}),
    });
    expect(respuesta.status).toBe(403);
  });

  it("rechaza con 401 un inicio de sesión que no es reciente", async () => {
    mocks.verifyIdToken.mockResolvedValue({ ...tokenDe("u1"), auth_time: 1000 });
    const respuesta = await POST(pedirSesion({ origin: "http://localhost" }), {
      params: Promise.resolve({}),
    });
    expect(respuesta.status).toBe(401);
  });

  it("crea la cookie HttpOnly con SameSite=Lax (204)", async () => {
    const respuesta = await POST(pedirSesion({ origin: "http://localhost" }), {
      params: Promise.resolve({}),
    });
    expect(respuesta.status).toBe(204);
    const cookie = respuesta.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("sesion=cookie-firmada");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
  });
});
