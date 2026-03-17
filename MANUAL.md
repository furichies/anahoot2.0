# 📖 Manual de Uso - Panel de Administración ANAHOOT V2

¡Felicidades por instalar ANAHOOT V2! En este manual aprenderemos a utilizar el panel de profesor para gestionar partidas, alumnos y calificaciones.

> 🧑‍🏫 **¿Qué es una partida en ANAHOOT?**
> Es una sesión sincrónica de preguntas y respuestas. El **profesor** proyecta su pantalla en clase (o la comparte por videoconferencia), mientras que el **alumno** se conecta a esa sala a través de su dispositivo móvil o PC usando un PIN de 4 dígitos. Cada pregunta aparece en la pantalla del profesor, pero las opciones de respuesta aparecen en los dispositivos de los alumnos. Las puntuaciones se envían instantáneamente.

---

## 🔑 Entornos: Profesor vs Alumno

*   **Entorno de Profesor (Host):** Esta es la vista que debe ser proyectada en la pizarra o pantalla principal. Aquí se crea la sala, se elige cuándo revelar los aciertos, y se muestra el podio con los tres primeros clasificados ("Leaderboard"). 
*   **Entorno de Alumno (Player):** Es un diseño minimalista donde solo aparecen cuatro botones gigantes (A, B, C, D). Está pensado para la velocidad y para evitar distracciones.

---

## 1. 🕹️ Cómo crear una partida y conseguir el PIN

Una vez dentro de tu Panel de Administración con un usuario de tipo "profesor":

1. Ve a la sección lateral **Nueva Partida**.
2. Dale al botón central que indica "**Generar PIN Sala**".
3. Serás redirigido a una gigantesca pantalla de lobby (sala de espera). Aquí verás tu **PIN de 4 dígitos** en grande.
4. Los alumnos solo tienen que entrar en la página web, elegir el rol de "alumno" o iniciar sesión, y escribir ese PIN para entrar.
5. Verás en tiempo real cómo tu contador de jugadores aumenta.
6. Pulsa continuar cuando quieras empezar. 

---

## 2. 📝 Cómo cargar preguntas (Repositorio JSON)

Puedes tener guardadas tus preguntas en tu ordenador sin depender de ANAHOOT.

1. Selecciona la pestaña lateral **Preguntas**.
2. Arrastra tu documento a la caja o haz clic en "Haz clic para buscar" y elige el archivo en tu PC.
3. Se cargarán las preguntas de manera instantánea o te aparecerá un error de formato si está mal escrito.

> ⚠️ **¡Atención! Las preguntas "NO SE SE ACUMULAN"**. Hemos diseñado el sistema para que la subida de un archivo *sobrescriba* y elimine automáticamente las preguntas anteriores para mantener limpia la base de datos de juegos pasados.

### Formato válido `.json`
Las preguntas **deben estar escritas** en un archivo digital llamado **JSON**. Este tipo de archivos respeta una estructura estricta. Aquí tienes un ejemplo válido que puedes copiar y modificar con un Bloc de Notas o cualquier editor de texto plano:

```json
[
  {
    "category": "Fisiología",
    "text": "¿Cuál es la función principal del riñón?",
    "options": {
      "A": "Producir bilis",
      "B": "Filtrar la sangre",
      "C": "Secretar insulina",
      "D": "Sintetizar glóbulos blancos"
    },
    "correctAnswer": "B",
    "explanation": "Los riñones filtran aproximadamente media taza de sangre por minuto, eliminando los desechos y el exceso de agua."
  },
  {
    "category": "Historia",
    "text": "¿En qué año se descubrió América?",
    "options": {
      "A": "1492",
      "B": "1453",
      "C": "1512",
      "D": "1290"
    },
    "correctAnswer": "A",
    "explanation": "Cristóbal Colón llegó en el año 1492."
  }
]
```
*(Mantén comillas dobles, comas, y la misma cantidad de llaves y corchetes que en el ejemplo).*

---

## 3. 📊 Visualización de Calificaciones

En la pestaña lateral **Calificaciones**, se procesan las respuestas reales que tus alumnos han dado en las salas. 
*   Aparecerá una **barrita de progreso** verde o roja, a modo de promedio visual global, con los usuarios que han estado participando de manera activa en juegos.
*   En la **tabla detallada**, se muestran desgloses partida por partida, para que puedas consultar cuánto sacó un alumno en la partida "4812" y si ese mismo alumno mejoró en la partida "9812". Todas las calificaciones están calculadas sobre un máximo de **10 puntos**.

---

## 4. 👥 Gestión de Alumnos

Para asegurar tus competiciones, solo los alumnos que tú registres pueden jugar y tener las calificaciones guardadas.

1. Ve a la sección **Gestión Alumnos**.
2. Rellena los tres campos ("Rellenar perfil").
   - **Usuario** (Ej: Manuel_22, Ana_Mate) -> Es lo que aparecerá en el Leaderboard en público. Recomendamos motes seguros.
   - **Email** -> Correo (real o ficticio) necesario para iniciar sesión.
   - **Contraseña** -> Preferiblemente usar la misma que dan los centros de estudio (Educamos, etc) o una generada (min: 6 letras/números).
3. Pulsa "Registrar Alumno".
4. Verás la aparición del usuario al instante debajo en **Alumnos Registrados**.
5. *Si te equivocas o el alumno se marcha, verás una pequeña papelera de reciclaje a la derecha de su nombre (Aparece y se pone roja cuando pasas el ratón por encima). Al pulsarla, sus datos se borrarán para siempre.*

---

## 5. 🖨️ Exportar las calificaciones

Al terminar tu trimestre, seguramente quieras trasladar todas estas notas de base 10 a tu propio registro (Excel, papel, Additio o iDoceo).

1. Abre la pestaña final **Exportar Reportes**.
2. Pulsa el gigantesco botón morado de **Generar Reporte PDF Final** y confirma. 
3. Se generará automáticamente un documento elegante en formato visual PDF, fechado con la hora actual, y con las puntuaciones organizadas. 
4. Puedes imprimirlo directamente o guardarlo en los archivos de tu escuela.
