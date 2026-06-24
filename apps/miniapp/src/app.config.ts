export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/practice/index',
    'pages/question/index',
    'pages/result/index',
    'pages/home/index',
    'pages/wrong-book/index',
    'pages/favorites/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f8faf8',
    navigationBarTitleText: 'JLPT 刷题',
    navigationBarTextStyle: 'black',
  },
});
