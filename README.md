# Tándem

App de gym para entrenar en pareja. Juan y Marian llevan la misma escalera de 12 semanas, cada uno con su rutina, y ven los kilos del otro en cuanto hay internet.

Hecho con ♥️ para uso personal. Sin fines de lucro.

## Qué hace

- Rutina del día, con calentamiento distinto para cada uno y variantes si el gym no tiene una máquina.
- Pesos, series marcadas, sesiones y promedios. La progresión muestra cómo va cada semana.
- Cardio extra, opcional, solo para Juan, después de las pesas.
- Funciona sin señal en el gym: guarda en el teléfono y sube al salir.
- Candado con PIN para que solo entren ellos dos. Al abrir, cada uno cae en su rutina.

## Con qué está hecha

- [React](https://react.dev/) 19 y [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) 7 y [Tailwind CSS](https://tailwindcss.com/) 4
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/), para instalarla en el teléfono
- [Supabase](https://supabase.com/) para el login y la base de datos
- Iconos de [Lucide](https://lucide.dev/)

Los videos de técnica apuntan a YouTube. Las miniaturas de los ejercicios son GIF de referencia para entrenar, no un producto que se venda.

## Correrla en local

```bash
npm install
```

Copia `.env.example` a `.env` y pega la URL del proyecto y la clave **anon / publishable** de Supabase. Esa clave va en `.env`, que no se sube a GitHub.

En el SQL Editor de Supabase corre `supabase/schema.sql` una vez, y crea las dos cuentas con PIN (el archivo SQL lo explica).

```bash
npm run dev
```

## Pull requests

Se aceptan. Si quieres cambiar algo, abre un PR y lo miramos.

Si esta app te sirve de idea para la tuya, adelante. La rutina y los datos de entrenamiento son de Juan y Marian.
