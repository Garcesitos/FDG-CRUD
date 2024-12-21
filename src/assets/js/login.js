window.addEventListener('load', function() {
    const formLogin = document.getElementById('formLogin');

    formLogin.addEventListener('submit', async function(event) {
        event.preventDefault(); 

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const loginSuccess = await window.electron.login(email, password);
            if (loginSuccess) {
                console.log('Login exitoso');
                window.location.href = 'menu.html';
            } else {
                console.log('Login fallido');
            }
        } catch (error) {
            console.error('Error durante el login:', error);
        }
    });
});




