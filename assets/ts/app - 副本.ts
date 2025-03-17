import noteDate from "./date.ts";
import farallonActions from "./action.ts";
import Douban from "./db.ts";
import { farallonComment } from "./comment.ts";
import imgZoom from "./zoom.ts";

declare global {
    interface Window {
        actionDomain: string;
        timeFormat: string;
        dbAPIBase: string;
        viewText: string;
        noComment: string;
        zoom: boolean;
    }
}

new noteDate({
    selector: ".humane--time",
    timeFormat: window.timeFormat,
});

class noteBase {
    constructor() {
        this.initThemeSwitch();
        this.initBack2Top();
        this.initMenu();
    }

    initMenu() {
        // 点击 menu--icon 切换菜单
        if (document.querySelector(".menu--icon")) {
            document.querySelector(".menu--icon")!.addEventListener("click", () => {
                document.querySelector(".site--nav")!.classList.toggle("is-active");
                document.querySelector("body")!.classList.toggle("menu--actived");
            });
        }

        // 点击 close--icon 关闭菜单
        if (document.querySelector(".close--icon")) {
            document.querySelector(".close--icon")!.addEventListener("click", () => {
                document.querySelector(".site--nav")!.classList.remove("is-active");
                document.querySelector("body")!.classList.remove("menu--actived");
            });
        }

        // 点击 mask 关闭菜单
        if (document.querySelector(".mask")) {
            document.querySelector(".mask")!.addEventListener("touchstart", () => {
                document.querySelector(".site--nav")!.classList.remove("is-active");
                document.querySelector("body")!.classList.remove("menu--actived");
            });
        }
    }

    initThemeSwitch() {
        const themeToggleBtn = document.querySelector(".theme-toggle-button");
        const sunIcon = document.querySelector(".sun > svg");
        const moonIcon = document.querySelector(".moon > svg");
        if (!themeToggleBtn || !sunIcon || !moonIcon) return;

        // 默认主题为亮色模式
        let currentTheme = localStorage.getItem("theme") || "light";

        // 设置初始主题和图标
        if (currentTheme === "dark") {
            document.body.classList.add("dark");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";
        } else {
            document.body.classList.remove("dark");
            sunIcon.style.display = "block";
            moonIcon.style.display = "none";
        }

        // 添加点击事件
        themeToggleBtn.addEventListener("click", () => {
            if (currentTheme === "light") {
                // 切换到暗色模式
                currentTheme = "dark";
                document.body.classList.add("dark");
                sunIcon.style.display = "none";
                moonIcon.style.display = "block";
            } else {
                // 切换到亮色模式
                currentTheme = "light";
                document.body.classList.remove("dark");
                sunIcon.style.display = "block";
                moonIcon.style.display = "none";
            }

            // 更新localStorage
            localStorage.setItem("theme", currentTheme);
        });
    }

    initBack2Top() {
        if (document.querySelector(".backToTop")) {
            const backToTop = document.querySelector(".backToTop") as HTMLElement;
            window.addEventListener("scroll", () => {
                const t = window.scrollY || document.documentElement.scrollTop;
                t > 200 ? backToTop.classList.add("is-active") : backToTop.classList.remove("is-active");
            });

            backToTop.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    }
}

new noteBase();

new farallonActions({
    singleSelector: ".article",
    articleSelector: ".block--item",
    text: window.viewText,
    actionDomain: window.actionDomain,
});

new Douban({
    baseAPI: window.dbAPIBase,
    container: ".db--container",
});

new farallonComment({
    actionDomain: window.actionDomain,
});

if (window.zoom) {
    new imgZoom();
}

if (document.querySelector(".search--icon")) {
    document.querySelector(".search--icon")!.addEventListener("click", () => {
        document.querySelector("body")!.classList.toggle("search--actived");
    });
}