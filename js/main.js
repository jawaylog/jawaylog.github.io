// 移除所有版权检查和注入代码后的纯净版本

//自动显示与隐藏顶部菜单，给阅读区域留出更大空间
(function () {
    if (window.innerWidth < 768) {
    var topMenu = document.querySelector(".header");
    if (!topMenu) return; 
    var lastScrollTop = 50;
    function throttle(func, delay) {
        var lastTime = 0;
        return function () {
            var now = Date.now();
            if (now - lastTime >= delay) {
                func.apply(this, arguments);
                lastTime = now;
            }
        };
    }
    function handleScroll() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 50 && scrollTop > lastScrollTop) {
            topMenu.classList.add("hide");
        } else {
            topMenu.classList.remove("hide");
        }
        lastScrollTop = scrollTop <= 50 ? 50 : scrollTop;
    }
    window.addEventListener("scroll", throttle(handleScroll, 100), false);
    }
})(); 


/*自定义菜单效果*/
const $menu = $(".menu");
const $openBtn = $(".icon-nav");
const $body = $("body");
const $header = $(".header");
const $commonElements = $(".blur");
const searchLayer = $('.search-layer');
const $main = $(".main");

function showNativeMenu() {
  if (!$main.length) return;
  const mainRect = $main[0].getBoundingClientRect();
  const scrollTop = $(window).scrollTop();
  const menuTop = mainRect.top + scrollTop;
  const menuLeft = mainRect.right + 10;
  $menu.css({ left: menuLeft, top: menuTop }).addClass('active');
  setTimeout(() => {
    $(document).on('click.menu', hideNativeMenu);
  }, 10);
  $('.menu > li').each(function(idx) {
      $(this)
        .addClass('animated fadeInLeftShort')
        .css('animation-delay', (idx * 0.09) + 's');
    });
}

function hideNativeMenu() {
  $menu.removeClass('active');
  $(document).off('click.menu');
  $('.menu > li').each(function(){
  $(this)
    .removeClass('animated fadeInLeftShort')
    .css('animation-delay', '');
});
}

// 切换移动菜单状态
function toggleMenuState(isOpen) {
    $menu.toggleClass("active", isOpen);
    $body.toggleClass("noscroll", isOpen);
    $commonElements.add($header).toggleClass("no-scroll", isOpen);
}

// 搜索框功能
function openSearch() {
    hideNativeMenu();//打开搜索框需要关闭菜单
    searchLayer.fadeIn(200).addClass('search-active');
    if (window.innerWidth < 768) {
        $body.addClass('noscroll');
        $commonElements.addClass('no-scroll');
        $header.addClass('bottom-line');
    }
}

function closeSearch() {
    searchLayer.removeClass('search-active').fadeOut(200);
    if (window.innerWidth < 768) {
        $body.removeClass('noscroll');
        $commonElements.removeClass('no-scroll');
        $header.removeClass('bottom-line');
    }
}

function closeSearchIfOpen() {
    if (searchLayer.hasClass('search-active')) {
        closeSearch();
        return true;
    }
    return false;
}

// 菜单按钮点击事件
$('.icon-nav').on('click', function (e) {
    e.stopPropagation();
    
    if (window.innerWidth >= 768) {
        // PC端 - 使用现有菜单容器
        showNativeMenu();
    } else {
        // 移动端逻辑
        const wasSearchOpen = closeSearchIfOpen();
        const isMenuOpen = $menu.hasClass("active");
        
        if (wasSearchOpen && !isMenuOpen) {
            setTimeout(() => toggleMenuState(true), 10);
        } else {
            toggleMenuState(!isMenuOpen);
        }
    }
});

// 事件委托处理
$(document)
    .on("click", ".menu", function(e) {
        e.stopPropagation();
    })
    .on("click", "#close", function(e) {
        e.stopPropagation();
        toggleMenuState(false);
    })
    .on("click", ".close-search", function(e) {
        e.stopPropagation();
        closeSearch();
    })
    .on("click", function(e) {
        // 移动端菜单关闭
        if ($menu.hasClass("active") && !$(e.target).closest('.menu, .icon-nav').length) {
            toggleMenuState(false);
        }
        
        // PC端菜单关闭
        if ($menu.hasClass('active') && !$(e.target).closest('.menu, .icon-nav').length) {
            hideNativeMenu();
        }
        
        // 搜索框关闭
        if (searchLayer.hasClass('search-active') && !$(e.target).closest('.search-layer, #search-btn').length) {
            closeSearch();
        }
    });

// 搜索按钮
$('#search-btn').on('click', function(e) {
    e.stopPropagation();
    searchLayer.hasClass('search-active') ? closeSearch() : openSearch();
});

// ESC键处理
$(document).keyup(function(e) {
    if (e.key === 'Escape') {
        closeSearch();
        
        if (window.innerWidth < 768) {
            if ($menu.hasClass("active")) {
                toggleMenuState(false);
            }
        } else {
            if ($menu.hasClass('active')) {
                hideNativeMenu();
            }
        }
    }
});
/** 顶部菜单结束 **/

/**首页轮播图初始化**/
document.addEventListener('DOMContentLoaded', function () {
  const isMobile = window.innerWidth < 768;
  const isHome = location.pathname === '/' || location.pathname === '/index';

  if (bannerSwitch !== 'on' || !isHome) return;

  const jsonData = document.getElementById('banner-json').textContent;
  let posts = [];
  try {
    posts = JSON.parse(jsonData);
  } catch (e) {
    console.error('无效的 banner JSON', e);
    return;
  }

  const container = document.querySelector('.banner-container');
  if (!container) return;

  if (isMobile) {
    // 生成移动端 swiper
    container.innerHTML = `
      <div class="swiper m">
        <div class="swiper-wrapper">
          ${posts.slice(0, 3).map(post => `
            <div class="swiper-slide">
              <a href="${post.link}" title="${post.title}" style="background-image:url('${post.thumb}')">
                <h1>${post.title}</h1>
              </a>
            </div>
          `).join('')}
        </div>
        <div class="swiper-pagination m"></div>
      </div>
    `;

    if (typeof Swiper !== 'undefined') {
      new Swiper('.swiper', {
        autoplay: true,
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          type: 'custom',
          renderCustom: function (swiper, current, total) {
            return Array.from({ length: total }).map((_, i) =>
              `<span class="swiper-pagination-bullet${i + 1 === current ? ' swiper-pagination-bullet-active' : ''}"></span>`
            ).join('');
          }
        }
      });
    }
  } else {
    // 生成 PC 端 banner
    const banner = document.createElement('div');
    banner.className = 'banner pc';

    const item1 = document.createElement('div');
    item1.className = 'banner-item';
    item1.innerHTML = `
      <a href="${posts[0].link}" title="${posts[0].title}">
        <div class="banner-thumb lazy-load" data-src="${posts[0].thumb}">
          <div class="banner-title"><h1>${posts[0].title}</h1></div>
        </div>
      </a>
    `;

    const item2 = document.createElement('div');
    item2.className = 'banner-item';
    for (let i = 1; i <= 2; i++) {
      item2.innerHTML += `
        <a href="${posts[i].link}" title="${posts[i].title}">
          <div class="banner-thumb lazy-load" data-src="${posts[i].thumb}">
            <div class="banner-title"><h1>${posts[i].title}</h1></div>
          </div>
        </a>
      `;
    }

    banner.appendChild(item1);
    banner.appendChild(item2);
    container.appendChild(banner);
    //调用懒加载函数
    initLazyLoad();
  }
});



// 懒加载逻辑
function initLazyLoad() {
    const lazyImages = Array.from(document.querySelectorAll('.lazy-load:not(.loaded):not(.failed)'));
    let loading = false;

    // 队列中第一个进入视口的图片加载
    function tryLoadNext() {
        if (loading) return;
        const next = lazyImages.find(img => img.classList.contains('in-view') && !img.classList.contains('loaded') && !img.classList.contains('failed'));
        if (!next) return;
        loading = true;
        const src = next.getAttribute('data-src');
        const tempImg = new Image();
        tempImg.src = src;
        tempImg.onload = () => {
            if (next.tagName.toLowerCase() === 'img') {
                next.src = src;
            } else {
                next.style.backgroundImage = `url('${src}')`;
            }
            next.classList.add('loaded');
            loading = false;
            tryLoadNext();
        };
        tempImg.onerror = () => {
            if (next.tagName.toLowerCase() === 'img') {
                next.src = '/usr/themes/OneBlog/static/img/error.jpg'; 
            } else {
                next.style.backgroundImage = `url('/usr/themes/OneBlog/static/img/error.jpg')`;
            }
            next.classList.add('failed');
            loading = false;
            tryLoadNext();
        };
    }

    // 只标记进入视口，不立即加载
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                tryLoadNext();
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    lazyImages.forEach(img => io.observe(img));
}

//加载更多
jQuery(document).ready(function($) {
    // 初始化懒加载
    initLazyLoad();
    let isLoading = false;
    function loadNextPage() {
        if (isLoading) return;
        var $next = $('.next');
        var href = $next.attr('href');
        if (!href) return;
        isLoading = true;
        $next.addClass('loading').text('正在努力加载…');
        $.ajax({
            url: href,
            type: 'get',
            error: function(request) {
                console.error('加载失败:', request);
                $next.removeClass('loading').text('点击查看更多');
                isLoading = false;
            },
            success: function(data) {
                $next.removeClass('loading').text('点击查看更多');
                // 提取新文章内容
                var $res = $(data).find('.post,.photo');
                $('#posts,#photos').append($res.fadeIn(300));

                // 替换下一页链接或结束提示
                var newhref = $(data).find('.next').attr('href');
                if (newhref) {
                    $next.attr('href', newhref);
                } else {
                    $next.remove();
                    document.getElementById("loadmore").innerHTML = "—&nbsp;&nbsp;&nbsp;暂无更多内容&nbsp;&nbsp;&nbsp;—";
                }

                initLazyLoad();
                
                $res.each(function() {
                    applyExcerptTruncate(this); // 仅对新增元素处理
                });
                
                isLoading = false;
            }
        });
    }

    // PC 端点击加载
    $('.next').click(function(e) {
        e.preventDefault();
        loadNextPage();
    });

    // 移动端自动触底加载
    if ($(window).width() < 768) {
        $(window).on('scroll', function() {
            if (isLoading) return;
            // 距离底部 100px 内触发加载
            if ($(window).scrollTop() + $(window).height() + 100 >= $(document).height()) {
                loadNextPage();
            }
        });
    }
});

// 摘要截取函数：移动端显示40字符摘要
function applyExcerptTruncate(context = document) {
    if (window.innerWidth > 768) return; // 只在移动端执行
    context.querySelectorAll('.post_preview p').forEach(el => {
        let text = el.getAttribute('data-full') || el.textContent.trim();
        // 首次设置 data-full 保证加载更多时不重复截断
        if (!el.getAttribute('data-full')) {
            el.setAttribute('data-full', text);
        }
        if (text.length > 40) {
            el.textContent = text.slice(0, 40) + '...';
        } else {
            el.textContent = text;
        }
    });
}

// 首次加载时执行
document.addEventListener('DOMContentLoaded', function () {
    applyExcerptTruncate();
});

/** 用户登录弹框 **/
document.addEventListener('DOMContentLoaded', function() {
    var loginButton = document.getElementById('login-button');
    if (!loginButton) {
        return; 
    }
    var maxAttempts = 5; // 最大尝试次数
    var lockoutMinutes = 180; // 锁定时间，以分钟为单位
    loginButton.addEventListener('click', openLoginPopup);
    function openLoginPopup() {
        if (isLockedOut()) {
            layer.msg(`登录过于频繁，请稍后再试！`);
            return;
        } else {
            clearLoginAttempts(); 
        }
        layer.open({
            type: 1,
            title: ' ',
            area: ['320px', 'auto'],
            skin: 'layui-memos',
            shadeClose: true,
            closeBtn: 1,
            content: `
                <form class="memos-form" id="login-form" method="post">
                    <h3>登录</h3>
                    <div class="flex-column">
                        <label for="name">账号</label>
                        <div class="inputForm">
                            <i class="iconfont icon-zhanghao"></i>
                            <input required class="input" type="text" name="name" id="name" placeholder="请输入账号" />
                        </div>
                    </div>
                    <div class="flex-column">
                        <label for="password">密码</label>
                        <div class="inputForm">
                            <i class="iconfont icon-mima"></i>
                            <input required class="input" type="password" name="password" id="password" placeholder="请输入密码" />
                            <i class="iconfont icon-eye" id="toggle-password"></i>
                        </div>
                    </div>
                    <button type="submit" id="submit-button" class="button-submit">登录</button>
                </form>
            `,
            success: function(layero, index) {
                var togglePassword = document.getElementById('toggle-password');
                var passwordInput = document.getElementById('password');
                togglePassword.addEventListener('click', function() {
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        togglePassword.classList.replace('icon-eye', 'icon-noeye');
                    } else {
                        passwordInput.type = 'password';
                        togglePassword.classList.replace('icon-noeye', 'icon-eye');
                    }
                });

                var loginForm = document.getElementById('login-form');
                var submitButton = document.getElementById('submit-button');

                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    submitButton.disabled = true;
                    submitButton.textContent = '正在登录，请稍后...';
                    submitButton.classList.add('not-allowed');
                    var formData = new FormData(loginForm);
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', loginAction, true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) {
                                if (xhr.responseURL.includes('/admin/')) {
                                    clearLoginAttempts(); 
                                    location.reload();
                                } else {
                                    handleFailedLogin();
                                }
                            } else {
                                handleFailedLogin();
                            }
                            resetButtonState();
                        }
                    };
                    xhr.onerror = function() {
                        handleFailedLogin();
                        resetButtonState();
                    };
                    xhr.send(formData);
                });
            }
        });
    }

    function handleFailedLogin() {
        var attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
        attempts += 1;
        localStorage.setItem('loginAttempts', attempts);
        if (attempts >= maxAttempts) {
            var lockoutTime = Date.now() + lockoutMinutes * 60 * 1000;
            localStorage.setItem('lockoutTime', lockoutTime);
            var lockoutHours = formatMinutesToHours(lockoutMinutes);
            layer.msg(`尝试次数过多，您已被锁定${lockoutHours}！`, {
                time: 3000 
            }, function() {
                layer.closeAll(); 
            });
        } else {
            layer.msg(`账号或密码错误，请检查后重新登录！`, {
                time: 2000 
            });
        }
    }

    function isLockedOut() {
        var lockoutTime = parseInt(localStorage.getItem('lockoutTime') || '0');
        return Date.now() < lockoutTime;
    }

    function clearLoginAttempts() {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');
    }

    function resetButtonState() {
        var submitButton = document.getElementById('submit-button');
        submitButton.disabled = false;
        submitButton.textContent = '登录';
        submitButton.classList.remove('not-allowed');
    }

    function formatMinutesToHours(minutes) {
        var hours = Math.floor(minutes / 60);
        var remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
    }
});
/** 用户登录弹框结束 **/

/**动态发布弹框开始**/
$(document).ready(function () {
    $('#publish-button').on('click', function () {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const commentUrl = document.querySelector('meta[name="comment-url"]').getAttribute('content');
        layer.open({
            type: 1,
            move: false,
            skin: 'layui-memos',
            area: ['420px', 'auto'], 
            title: ' ',
            shadeClose: true, 
            closeBtn: 1,
            content: `
                <form class="memos-form" id="comment-form" method="post" action="${commentUrl}" role="form">
                    <h3>发布动态</h3>
                    <textarea name="text" id="textarea" required></textarea>
                    <input type="hidden" name="_" value="${csrfToken}">
                    <button type="button" id="submit-memos" class="button-submit">发布</button>
                </form>
            `
        });

        $('#submit-memos').on('click', function () {
            const textContent = $('#textarea').val();
            if (!textContent) {
                layer.msg('请输入内容！');
                return;
            }
            // 使用 AJAX 提交表单
            const formData = $('#comment-form').serialize(); 
            $.ajax({
                url: commentUrl,
                type: 'POST',
                data: formData,
                success: function (response) {
                    if (response && response.error) {
                        layer.msg(response.error, { icon: 2 });
                    } else {
                        layer.closeAll(); 
                        layer.msg('发布成功！'); 
                        
                        // 延迟2秒后刷新页面
                        setTimeout(function() {
                            location.reload(); 
                        }, 1500); // 延迟1.5s刷新页面

                    }
                },
                error: function () {
                    layer.msg('发布失败，请稍后重试！', { icon: 2 });
                }
            });
        });
    });
});

/**动态发布弹框结束**/

/***评论点赞以及计数***/
$(document).ready(function() {
    $("#comments").on('click', "a[id^='commentLikeOpt']", function() {
        var coid = $(this).data("coid");
        var recording = $(this).attr("data-recording");
        if(recording){
            layer.msg('你已经点过赞啦！感谢你的喜爱！');
            return;
        }
        $.ajax({
            url: commentLikeUrl,
            type: "POST",
            data: {
                coid: coid,
                behavior: 'dz'
            },
            async: true,
            dataType: "json",
            success: function(data) {
                if (data == null) {} else {
                    if(data.state == 'success'){
                        $('#commentLikeSpan-'+coid).text(data.num);
                        $('#commentLikeI-'+coid).removeClass("icon-like").addClass("icon-liked");
                        $('#commentLikeOpt-'+coid).attr("data-recording", "1");
                    } else {
                        alert(data.message || "点赞失败，请稍后重试");
                    }
                }
            },
            error: function(err) {
                alert("点赞失败，请稍后重试");
            }
        });
    });
});
/***评论点赞结束***/

/**夜间模式**/
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// 切换夜间模式的核心函数
function toggleProtectEye(isDarkMode) {
    const htmlElement = document.documentElement;
    const logoElement = document.getElementById('logo');
    
    if (isDarkMode) {
        htmlElement.classList.add('night');
        setCookie('eyeProtectMode', 'dark', 365);
        if (logoElement) {
            logoElement.style.backgroundImage = `url(${logoWhiteUrl})`;
        }
    } else {
        htmlElement.classList.remove('night');
        setCookie('eyeProtectMode', 'light', 365);
        if (logoElement) {
            logoElement.style.backgroundImage = `url(${logoUrl})`;
        }
    }
}

// 更新两个开关状态
function updateToggleState(isDarkMode) {
    const toggle1 = document.getElementById('night1');
    const toggle2 = document.getElementById('night2');
    
    if (toggle1) toggle1.checked = isDarkMode;
    if (toggle2) toggle2.checked = isDarkMode;
}

function initProtectEye() {
    const currentTheme = getCookie('eyeProtectMode');
    const htmlElement = document.documentElement;
    const logoElement = document.getElementById('logo');
    
    // 初始化状态
    const isDarkMode = currentTheme === 'dark';
    toggleProtectEye(isDarkMode);
    updateToggleState(isDarkMode);
    
    // 为两个开关添加事件监听器
    const toggle1 = document.getElementById('night1');
    const toggle2 = document.getElementById('night2');
    
    if (toggle1) {
        toggle1.addEventListener('change', function() {
            toggleProtectEye(this.checked);
            updateToggleState(this.checked);
        });
    }
    
    if (toggle2) {
        toggle2.addEventListener('change', function() {
            toggleProtectEye(this.checked);
            updateToggleState(this.checked);
        });
    }
}

document.addEventListener('DOMContentLoaded', initProtectEye);
/**夜间模式结束**/

/**代码块一键复制按钮**/
document.addEventListener('DOMContentLoaded', function() {
    // 查找所有代码块
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(function(codeBlock) {
        // 创建复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.textContent = '复制';
        
        // 将按钮添加到代码块的父元素（pre标签）中
        const preElement = codeBlock.parentNode;
        preElement.style.position = 'relative';
        preElement.appendChild(copyButton);
        
        // 点击复制按钮的事件
        copyButton.addEventListener('click', function() {
            // 移除过滤器，确保能够复制全部代码
            codeBlock.style.filter = 'none';
            
            // 创建一个临时textarea来复制代码
            const textarea = document.createElement('textarea');
            textarea.value = codeBlock.textContent;
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                // 执行复制命令
                const successful = document.execCommand('copy');
                if (successful) {
                    // 显示复制成功提示
                    copyButton.textContent = '已复制';
                    copyButton.style.backgroundColor = 'rgba(40, 167, 69, 0.7)';
                    
                    // 2秒后恢复按钮状态
                    setTimeout(function() {
                        copyButton.textContent = '复制';
                        copyButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    }, 2000);
                } else {
                    copyButton.textContent = '复制失败';
                }
            } catch (err) {
                console.error('复制失败:', err);
                copyButton.textContent = '复制失败';
            }
            
            // 清理临时元素
            document.body.removeChild(textarea);
        });
        
        // 取消代码块的模糊效果，让用户直接看到代码
        codeBlock.style.filter = 'none';
    });
});