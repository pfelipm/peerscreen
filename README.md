# PeerScreen

PeerScreen es una extensión para Google Chrome que te permite compartir tu pantalla con otros usuarios de forma sencilla y segura. Utilizando la tecnología WebRTC, la conexión se establece directamente de navegador a navegador (peer-to-peer), garantizando una baja latencia y la máxima privacidad, ya que el vídeo no pasa por ningún servidor intermedio. La extensión, construida sobre la moderna arquitectura Manifest V3 de Chrome, genera un ID de sesión único y un código QR para que otros usurios con la extensión también instalada puedan unirse a tu retransmisión al instante.

<p align="center">
  <img src="./readme-files/ps-principal.png">
</p>

---

## ✨ Características Principales

* **Conexión Segura P2P:** El streaming de vídeo se realiza directamente entre tu navegador y el de los espectadores gracias a WebRTC.
* **Compartir con Facilidad:** Inicia una sesión y compártela al instante mediante un ID único o un código QR.
* **Controles para el Anfitrión:** Pausa y reanuda la transmisión en cualquier momento.
* **Soporte Multi-espectador:** Permite que varios usuarios se unan a la misma sesión. El anfitrión puede establecer el número máximo de espectadores desde la interfaz.
* **Internacionalización:** Interfaz disponible en español e inglés. Detecta automáticamente el idioma del navegador y, además, permite al usuario forzar su preferencia.
* **Arquitectura Moderna:** Desarrollada desde cero para ser compatible con Manifest V3 de Chrome.
* **Ligera y Privada:** No requiere servicios de sincronización de Google y almacena las preferencias localmente.

![PeerScreen Banner](/readme-files/ps-collage.png)

---

## 💡 Caso de Uso y Limitaciones

**Caso de Uso Principal:**
La extensión se ha diseñado de manera específica para funcionar de forma óptima en el contexto de un **aula de formación o una sala de reuniones**, permitiendo emitir la pantalla de un docente, ponente o estudiante al resto de asistentes conectados a la **misma red local (WiFi)**.

**Limitaciones de Conexión (NAT Traversal):**
Por sencillez y para mantener la extensión gratuita, **no se utilizan servidores TURN**. Esto tiene una implicación importante:
* ✅ La conexión funcionará sin problemas entre usuarios dentro de la misma red.
* ❌ Es muy probable que la conexión **falle** si el emisor y el receptor se encuentran en redes diferentes y restrictivas (por ejemplo, dos redes de empresa distintas, o una red móvil y una red doméstica con NAT simétrico). Esto se debe a que sin un servidor TURN es muy difícil atravesar ciertos tipos de NAT.

---

## 🚀 Instalación

### Opción 1: Desde la Chrome Web Store (Recomendado)

1.  Visita la página de PeerScreen en la Chrome Web Store: **[ENLACE A LA CHROME WEB STORE]**
2.  Haz clic en "Añadir a Chrome".
3.  ¡Listo! Ya puedes usar la extensión.

### Opción 2: Desde el código fuente (para desarrolladores y administradores TIC)

1.  Descarga y descomprime o clona este repositorio en tu máquina local:
    ```bash
    git clone https://github.com/pfelipm/peerscreen.git
    ```
2.  Abre Google Chrome y ve a la página de extensiones: `chrome://extensions/`.
3.  Activa el **"Modo de desarrollador"** en la esquina superior derecha.
4.  Haz clic en el botón **"Cargar descomprimida"**.
5.  Selecciona la carpeta del repositorio que acabas de descargar o clonar. La extensión se instalará localmente.

Esta opción puede facilitar el despliegue de la extensión en un aula en la que los ordenadores estén configurados para navegar de manera predeterminada en modo incógnito. En este caso, tras instalarla en el navegador de cada equipo, marca la opción **"Permitir en incógino"** en los ajustes de la extensión para que permanezca activa en este modo.

---

## 💙 Créditos

Este proyecto ha sido creado y es mantenido por **[Pablo Felip](https://www.linkedin.com/in/pfelipm/)**.

Se utilizan las siguientes bibliotecas de terceros:
* [PeerJS](https://peerjs.com/)
* [QRCode.js](https://github.com/davidshimjs/qrcodejs)

---

## ✊ Licencia

Este proyecto se distribuye bajo los términos del archivo [LICENSE](/LICENSE).