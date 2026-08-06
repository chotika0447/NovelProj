// โหลดค่าที่เคยบันทึก
const footer = document.getElementById("footer");
const settings = document.getElementById("settings");
const navbar = document.getElementById("navbar");

window.addEventListener("DOMContentLoaded", () => {
    const savedFontSize = localStorage.getItem("fontSize");
    const savedFontFamily = localStorage.getItem("fontFamily");
    const savedTheme = localStorage.getItem("theme");

    if (savedFontSize) document.body.style.fontSize = savedFontSize;
    if (savedFontFamily) document.body.style.fontFamily = savedFontFamily;
    if (savedTheme === "dark") {
        document.getElementById("themeSwitch").checked = true;
        enableDarkMode();
    }
});

// เปลี่ยน font size
const fontSizeSelect = document.getElementById("fontSizeSelect");
if (fontSizeSelect) {
    fontSizeSelect.addEventListener("change", function () {
        document.body.style.fontSize = this.value;
        localStorage.setItem("fontSize", this.value);
    });
}

// เปลี่ยน font family
const fontFamilySelect = document.getElementById("fontFamilySelect")
if (fontFamilySelect) {
    fontFamilySelect.addEventListener("change", function () {
        document.body.style.fontFamily = this.value;
        localStorage.setItem("fontFamily", this.value);
    });
}

// เปลี่ยน theme
const themeSwitch = document.getElementById("themeSwitch");
if (themeSwitch) {
    themeSwitch.addEventListener("change", function () {
        if (this.checked) {
            localStorage.setItem("theme", "dark");
            enableDarkMode();
        } else {
            localStorage.setItem("theme", "light");
            disableDarkMode();
        }
    });
}

function enableDarkMode() {
    // Navbar
    if (navbar) {
        navbar.classList.remove("navbar-light", "bg-light");
        navbar.classList.add("navbar-dark", "bg-dark");
    }

    // Settings modal
    if (settings) {
        settings.classList.remove("bg-white", "text-dark");
        settings.classList.add("bg-dark", "text-white");
    }

    // Body
    document.body.style.backgroundColor = "#121212";
    document.body.style.color = "white";

    // Footer
    if (footer) {
        footer.classList.remove("bg-light", "text-dark");
        footer.classList.add("bg-dark", "text-white");
    }

}

function disableDarkMode() {
    // Navbar
    if (navbar) {
        navbar.classList.remove("navbar-dark", "bg-dark");
        navbar.classList.add("navbar-light", "bg-light");
    }

    // Settings modal
    if (settings) {
        settings.classList.remove("bg-dark", "text-white");
        settings.classList.add("bg-white", "text-dark");
    }

    // Body
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";

    // Footer
    if (footer) {
        footer.classList.remove("bg-dark", "text-white");
        footer.classList.add("bg-light", "text-dark");
    }
}