@import 'tailwindcss';

:root {
  color-scheme: dark;
  font-family: Inter, 'Segoe UI', sans-serif;
  line-height: 1.5;
  font-weight: 400;
  background: #020817;
  color: #e2e8f0;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(34, 197, 94, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.12), transparent 20%),
    #020817;
}

button,
input,
select {
  font: inherit;
}

#root {
  min-height: 100vh;
}
