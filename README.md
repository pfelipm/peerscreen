# PeerScreen

![PeerScreen Banner](URL_DEL_BANNER_O_IMAGEN_PRINCIPAL)

## Descripción general

PeerScreen es una extensión para Google Chrome que te permite compartir tu pantalla con otros usuarios de forma sencilla y segura. Utilizando la tecnología WebRTC, la conexión se establece directamente de navegador a navegador (peer-to-peer), garantizando una baja latencia y la máxima privacidad, ya que el vídeo no pasa por ningún servidor intermediario. La extensión, construida sobre la moderna arquitectura Manifest V3 de Chrome, genera un ID de sesión único y un código QR para que otros puedan unirse a tu retransmisión al instante. Es la herramienta perfecta para demostraciones rápidas, soporte técnico o colaboración en tiempo real sin necesidad de software de terceros.

---

## ✨ Características Principales

* **Conexión Segura P2P:** El streaming de vídeo se realiza directamente entre tu navegador y el de los espectadores gracias a WebRTC, sin servidores intermediarios.
* **Compartir con Facilidad:** Inicia una sesión y compártela al instante mediante un ID único o un código QR.
* **Controles para el Anfitrión:** Pausa y reanuda la transmisión en cualquier momento.
* **Soporte Multi-espectador:** Permite que varios usuarios se unan a la misma sesión (configurable por el anfitrión).
* **Internacionalización:** Interfaz disponible en español e inglés, con un selector para forzar el idioma deseado.
* **Arquitectura Moderna:** Desarrollada desde cero para ser compatible con Manifest V3 de Chrome.
* **Ligera y Privada:** No requiere servicios de sincronización de Google y almacena las preferencias localmente.

---

## 🚀 Instalación

### Opción 1: Desde la Chrome Web Store (Recomendado)

1.  Visita la página de PeerScreen en la Chrome Web Store: **[ENLACE A LA CHROME WEB STORE]**
2.  Haz clic en "Añadir a Chrome".
3.  ¡Listo! Ya puedes usar la extensión.

### Opción 2: Desde el código fuente (Para desarrolladores)

1.  Clona este repositorio en tu máquina local:
    ```bash
    git clone [https://github.com/pfelipm/peerscreen.git](https://github.com/pfelipm/peerscreen.git)
    ```
2.  Abre Google Chrome y ve a la página de extensiones: `chrome://extensions/`.
3.  Activa el **"Modo de desarrollador"** en la esquina superior derecha.
4.  Haz clic en el botón **"Cargar descomprimida"**.
5.  Selecciona la carpeta del repositorio que acabas de clonar. La extensión se instalará localmente.

---

## 💙 Créditos

Este proyecto ha sido creado y es mantenido por **[Pablo Felip](https://www.linkedin.com/in/pfelipm/)**.

Se utilizan las siguientes bibliotecas de terceros:
* [PeerJS](https://peerjs.com/)
* [QRCode.js](https://github.com/davidshimjs/qrcodejs)

---

## ✊ Licencia

**[AQUÍ PUEDES PONER EL NOMBRE DE TU LICENCIA, POR EJEMPLO: MIT, GPL, ETC.]**
