import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sin esto, los componentes de una prueba seguirían en pantalla durante la siguiente.
afterEach(() => cleanup());
