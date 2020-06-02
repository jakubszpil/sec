import React from 'react';
import Header from './Header';
function Layout({ children }) {
  return (
    <div>
      <Header />
      <main
        style={{
          marginTop: 88,
        }}
      >
        {children}
      </main>
      <footer></footer>
    </div>
  );
}

export default Layout;
