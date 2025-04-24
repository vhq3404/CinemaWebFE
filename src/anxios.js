// src/axios.js

import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api/users',  // Đảm bảo URL này đúng với API của User Service
    headers: {
        'Content-Type': 'application/json',
    }
});

export default instance;
