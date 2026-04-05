document.addEventListener('DOMContentLoaded', function() {
    // 计算相对时间的函数
    function formatRelativeTime(dateString) {
        const postDate = new Date(dateString);
        const now = new Date();
        const diffInMs = now - postDate;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInYears = Math.floor(diffInDays / 365);

        // 超过5年显示绝对日期
        if (diffInYears >= 5) {
            return postDate.getFullYear() + '/' +
                   String(postDate.getMonth() + 1).padStart(2, '0') + '/' +
                   String(postDate.getDate()).padStart(2, '0');
        }

        // 相对时间格式
        if (diffInMinutes < 1) return '刚刚';
        if (diffInMinutes < 60) return diffInMinutes + '分钟前';
        if (diffInHours < 24) return diffInHours + '小时前';
        if (diffInDays < 30) return diffInDays + '天前';
        if (diffInDays < 365) return Math.floor(diffInDays / 30) + '个月前';
        return diffInYears + '年前';
    }

    // 更新所有文章日期显示
    document.querySelectorAll('.post-date').forEach(element => {
        const dateString = element.getAttribute('data-date');
        element.textContent = formatRelativeTime(dateString);
    });
});