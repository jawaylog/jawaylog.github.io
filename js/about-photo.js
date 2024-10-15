//头部背景图随机显示
var data = [
  { text: '拍摄于广州机场北', image: 'https://img.xieha.cn/i/2024/10/13/670ab660be58e.webp' },
  { text: '拍摄于广州机场北', image: 'https://img.xieha.cn/i/2024/10/13/670ab660be58e.webp' },
  { text: '拍摄于广州机场北', image: 'https://img.xieha.cn/i/2024/10/13/670ab660be58e.webp' }
];

var randomIndex = Math.floor(Math.random() * data.length);
var randomItem = data[randomIndex];

document.querySelector('.about-img img').src = randomItem.image;
document.querySelector('.about-img-intro').textContent = randomItem.text;