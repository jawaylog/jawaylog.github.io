
// 命名空间隔离
var OneBlog = OneBlog || {};

// 响应式文章行数修复
OneBlog.fixResponsiveLayout = (function() {
    'use strict';
    
    // 配置参数（通过模板引擎渲染时注入）
    const config = {
        mobileBreakpoint: 768,
        articleMaxHeight: '80px',
        lineClamp: 3,
        resizeDelay: 150
    };
    
    let resizeTimer = null;
    
    // 初始化函数
    function init() {
        // 确保DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupEventListeners);
        } else {
            setupEventListeners();
        }
    }
    
    // 设置事件监听
    function setupEventListeners() {
        // 窗口大小变化监听
        window.addEventListener('resize', handleResize);
        
        // 初始执行一次
        handleResize();
        
        // 夜间模式切换时重绘
        document.addEventListener('nightModeChanged', handleResize);
    }
    
    // 处理窗口大小变化
    function handleResize() {
        clearTimeout(resizeTimer);
        
        resizeTimer = setTimeout(() => {
            const isMobile = window.innerWidth <= config.mobileBreakpoint;
            adjustArticleStyles(isMobile);
            forceRedraw();
        }, config.resizeDelay);
    }
    
    // 调整文章容器样式
    function adjustArticleStyles(isMobile) {
        const wrappers = document.querySelectorAll('.post_content_wrapper');
        
        wrappers.forEach(wrapper => {
            if (isMobile) {
                wrapper.style.maxHeight = config.articleMaxHeight;
                wrapper.style.webkitLineClamp = config.lineClamp;
                wrapper.style.display = '-webkit-box';
                wrapper.style.webkitBoxOrient = 'vertical';
                wrapper.style.overflow = 'hidden';
            } else {
                wrapper.style.maxHeight = '';
                wrapper.style.webkitLineClamp = '';
                wrapper.style.display = '';
            }
        });
    }
    
    // 强制重绘
    function forceRedraw() {
        const articles = document.querySelectorAll('.post');
        
        articles.forEach(article => {
            article.style.visibility = 'hidden';
            article.offsetHeight; // 触发回流
            article.style.visibility = 'visible';
        });
    }
    
    // 暴露公共方法
    return {
        init: init,
        adjustLayout: handleResize
    };
})();

// 轮播图初始化（修复版）
OneBlog.initBanner = (function() {
    'use strict';
    
    function init() {
        // 从DOM获取配置（由模板引擎渲染时设置）
        const bannerElement = document.getElementById('banner-container');
        if (!bannerElement) return;
        
        const config = {
            autoSwitch: bannerElement.dataset.switch === 'on',
            delay: parseInt(bannerElement.dataset.delay || '5000')
        };
        
        if (config.autoSwitch && window.Swiper) {
            new Swiper('.banner-container', {
                loop: true,
                autoplay: {
                    delay: config.delay,
                    disableOnInteraction: false
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true
                }
            });
        }
    }
    
    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', init);
    
    return { init: init };
})();

// 初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    OneBlog.fixResponsiveLayout.init();
    
    // 修复代码高亮
    if (window.hljs) {
        document.querySelectorAll('pre code').forEach(block => {
            block.style.filter = 'none';
            hljs.highlightElement(block);
        });
    }
});
