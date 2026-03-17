# 🛠️ Guía de Instalación para ANAHOOT V2

¡Bienvenido! Esta guía está diseñada para que cualquier persona, sin importar sus conocimientos técnicos, pueda instalar y tener funcionando su propia versión de ANAHOOT en internet de forma **totalmente gratuita**. 

El proceso consta de tres grandes pasos:
1. Hacer una copia del código en GitHub.
2. Crear la base de datos en Supabase.
3. Publicar la aplicación en Vercel.

---

## 🚀 PASO 1: Copiar el código en GitHub

GitHub es como una gran "nube" o biblioteca web donde se guardan los archivos de código de las aplicaciones. Necesitas tener tu propia copia guardada allí.

1. Entra en [github.com](https://github.com/) y pulsa en el botón **Sign up** (Registrarse) arriba a la derecha. 
2. Sigue las instrucciones en pantalla: introduce tu correo electrónico, inventa una contraseña y elige un nombre de usuario. Valida tu cuenta con el código que te enviarán a tu correo.
3. Una vez dentro de tu nueva cuenta de GitHub, ve al enlace del código original de ANAHOOT (el que te haya proporcionado el creador).
4. Arriba a la derecha verás un botón que dice **Fork** (Bifurcar). Púlsalo y luego haz clic en **Create fork**. 
   > *¿Qué hace esto? Simplemente hace una copia exacta del código original y la guarda en tu propia cuenta de GitHub, para que sea tuya.*

---

## 💾 PASO 2: Crear la Base de Datos en Supabase

Supabase es el servicio que se encargará de guardar las preguntas, las contraseñas de los alumnos y las puntuaciones.

1. Entra en [supabase.com](https://supabase.com/) y pulsa en **Start your project**.
2. Te pedirá que inicies sesión. Elige la opción **Continue with GitHub** (Continuar con GitHub) y autoriza el acceso. ¡Ya tienes cuenta!
3. Haz clic en el botón verde **New Project** (Nuevo proyecto).
   - En *Organization*, elige tu nombre.
   - En *Name*, ponle el nombre que quieras (ej: `mibasededatos-anahoot`).
   - En *Database Password*, inventa una contraseña fuerte (anótala, aunque rara vez la vas a usar).
   - En *Region*, elige la más cercana a ti (ej: Frankfurt o Paris si estás en Europa).
   - Pulsa **Create new project** y espera un par de minutos a que termine de configurarse.
4. Una vez terminado, en el menú lateral izquierdo de Supabase, busca la opción **SQL Editor** (tiene el icono de una ventana de código `</>`).
5. Pulsa en **New query** (Nueva consulta).
6. Ahora debes abrir el archivo llamado `supabase-schema.sql` que viene dentro del código que copiaste en el Paso 1. Copia todo su texto, pégalo en la ventana en blanco de Supabase y pulsa el botón verde **Run** (Ejecutar) abajo a la derecha. Debería decir *Success*. Acabas de crear todas las tablas necesarias.
7. Para terminar con Supabase, ve al icono del engranaje abajo a la izquierda que dice **Project Settings** (Ajustes del proyecto) y luego entra en **API**. Verás varias contraseñas (llaves) que vas a necesitar en el siguiente paso. No cierres esta pestaña.

---

## 🌐 PASO 3: Publicar la Aplicación en Vercel

Vercel es el servidor que tomará tu código de GitHub y tu base de datos de Supabase y lo convertirá en la página web pública a la que entrarán tus alumnos.

1. Entra en [vercel.com](https://vercel.com/) y pulsa en **Sign Up**.
2. Elige **Continue with GitHub** para usar la misma cuenta que creaste al principio. Autoriza el acceso.
3. Una vez en tu panel principal de Vercel, pulsa en el botón negro **Add New...** y elige **Project**.
4. Te aparecerá una lista con los repositorios de tu GitHub. Busca el de tu copia de ANAHOOT y pulsa el botón **Import** que está a su lado.
5. Se abrirá una ventana de configuración. Baja hasta la sección que dice **Environment Variables** (Aparece desplegable). Esta es la parte más importante: le vamos a dar a la página web las llaves de nuestra base de datos para que puedan hablar entre sí.
6. Volviendo a la pestaña de Supabase que dejaste abierta (Project Settings -> API), vas a crear **3 variables**:

   * **Variable 1:**
     - En *Name* (Vercel) escribe exactamente: `NEXT_PUBLIC_SUPABASE_URL`
     - En *Value* pega el texto que aparece en Supabase bajo el apartado **Project URL**.
     - Pulsa *Add*.
   * **Variable 2:**
     - En *Name* escribe: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - En *Value* pega el texto largo que aparece en Supabase bajo **Project API keys (anon / public)**.
     - Pulsa *Add*.
   * **Variable 3:**
     - En *Name* escribe: `SUPABASE_SERVICE_ROLE_KEY`
     - En *Value* pega el texto que aparece en Supabase bajo **Project API keys (service_role / secret)**. *(Puede que necesites pulsar "Reveal" para verlo)*.
     - Pulsa *Add*.

7. Finalmente, pulsa el botón negro grande **Deploy** (Desplegar).

¡Y listo! Vercel tardará un par de minutos en construir la página. Cuando termine, te mostrará un mensaje de felicitación y botones para visitar tu nueva página web. Acabas de conseguir tu propio enlace público (ej. *tu-proyecto.vercel.app*) que ya puedes usar y compartir.

> 📝 **Siguiente paso:** Para aprender a manejar tu nueva plataforma virtual, crear alumnos y subir preguntas, lee el archivo [MANUAL.md](./MANUAL.md).
