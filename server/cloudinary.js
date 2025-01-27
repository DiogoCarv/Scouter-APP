const cloudinary = require('cloudinary').v2;

// Configuração do Cloudinary com suas credenciais
cloudinary.config({
    cloud_name: 'dyn6ts7im', // Substitua pelo seu cloud name
    api_key: '799737265176618', // Substitua pela sua API key
    api_secret: 'bD7Rh59mC9Uc2m1zucnsf1JntJw', // Substitua pelo seu API secret
});

module.exports = cloudinary;