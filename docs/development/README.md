# 🐳 Uso de Dev Container en VS Code

Este proyecto incluye configuración para **Dev Containers** en VS Code, lo que permite levantar un entorno de desarrollo estandarizado con todas las dependencias necesarias sin necesidad de instalarlas directamente en tu máquina.

---

## ✅ Requisitos previos

Asegúrate de tener instalado en tu equipo:

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)
- Extensión **Dev Containers**: [ms-vscode-remote.remote-containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- (Opcional en Windows) **WSL2** con una distribución Linux configurada

---

## 🚀 Abrir el proyecto en un Dev Container

1. Clona este repositorio:

    ```bash
    git clone https://github.com/Ci-Comp-Overflow/ci-comp-overflow.git
    cd ci-comp-overflow
    ```

2. Abre VS Code, presiona `Ctrl/Cmd + Shift + P` y selecciona:

    - `> Dev Containers: Open Folder in Container...`
    - Selecciona la carpeta raíz del proyecto.

3. VS Code construirá el contenedor con las dependencias preinstaladas y montará tu código.

---

## ⚙️ Personalización del Dev Container

El archivo de configuración se encuentra en:

```
.devcontainer/devcontainer.json
```

Algunas opciones que puedes modificar:

- **Extensiones de VS Code** que se instalan automáticamente.
- **Dockerfile o imagen base** usada para el contenedor.
- **Montaje de volúmenes** (para preservar dependencias o caché).

---

## 🛠️ Solución de problemas comunes

- **Error de permisos en Linux**  
  Asegúrate de que tu usuario pertenezca al grupo `docker`.

---

## 📚 Recursos adicionales

- Documentación oficial: [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- Guía Docker Desktop: [Instalación](https://docs.docker.com/get-docker/)
