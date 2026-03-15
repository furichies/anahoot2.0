# 🎓 ANAHOOT V2.0

**ANAHOOT V2.0** es una plataforma de aprendizaje interactivo y síncrono en tiempo real, inspirada en populares herramientas educativas como *Kahoot!*.

## 🎯 Finalidad de la Aplicación

El objetivo principal de ANAHOOT es dinamizar el aprendizaje en el aula (o en entornos remotos). Permite a los **Profesores (Hosts)** crear salas virtuales, cargar baterías de preguntas y dirigir el ritmo de una partida en la que los **Alumnos (Players)** compiten simultáneamente respondiendo desde sus propios dispositivos móviles o computadoras.

A diferencia de su versión anterior (que era asíncrona e individual), la versión 2.0 se enfoca en la **experiencia multijugador síncrona**, fomentando la competencia sana y el compromiso del estudiante a través de respuestas en tiempo real, puntuaciones inmediatas y retroalimentación visual.

## 🚀 Tecnologías y Arquitectura

Este proyecto cuenta con una arquitectura moderna y escalable dividida en dos pilares principales:

1. **Frontend (Vercel):** La interfaz visual (para profesores y alumnos) está construida íntegramente con **Next.js 15** (App Router) y **TailwindCSS**. Se recomienda encarecidamente **Vercel** como la plataforma de alojamiento (hosting) por excelencia para este front-end, ya que ofrece un despliegue optimizado y sin fricciones para proyectos Next.js.
   
2. **Backend (Supabase):** En lugar de un servidor backend tradicional, ANAHOOT V2.0 utiliza **Supabase** (el ecosistema open-source basado en PostgreSQL). Supabase se encarga de:
   * **Base de datos:** Almacenamiento seguro de preguntas, partidas, usuarios y notas mediante tablas PostgreSQL.
   * **Autenticación:** Gestión segura del registro y login de profesores y alumnos.
   * **Tiempo Real (WebSockets):** Sincronización instantánea del estado de la partida entre el profesor y todos los alumnos conectados gracias a Supabase Realtime (Presence & Broadcasts).

## 📝 Licencia

Este proyecto se distribuye bajo la licencia **GNU General Public License v3.0 (GPLv3)**.

Esto significa que eres libre de usar, modificar y distribuir el software, siempre y cuando cualquier trabajo derivado mantenga la misma licencia GPLv3, asegurando así que el proyecto y sus modificaciones permanezcan libres y abiertos para la comunidad.

---
*Desarrollado para potenciar la educación mediante la tecnología de forma libre y accesible.*
