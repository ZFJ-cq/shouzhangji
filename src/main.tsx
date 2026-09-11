import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './globals.css';

// 渲染前按持久化偏好设置主题，避免深色模式闪烁
try {
  if (localStorage.getItem('mint-theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
} catch {
  /* localStorage 不可用时忽略 */
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
