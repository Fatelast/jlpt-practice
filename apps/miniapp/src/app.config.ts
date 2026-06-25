export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/practice/index',
    'pages/question/index',
    'pages/result/index',
    'pages/progress/index',
    'pages/wrong-book/index',
    'pages/favorites/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f8faf8',
    navigationBarTitleText: 'JLPT刷题',
    navigationBarTextStyle: 'black',
  },
});
