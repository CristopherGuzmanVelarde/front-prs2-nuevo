// User.js - User Model Class
class User {
    constructor(userData = {}) {
        this.id = userData.id || null;
        this.firstname = userData.firstname || '';
        this.lastname = userData.lastname || '';
        this.documentType = userData.documentType || '';
        this.documentNumber = userData.documentNumber || '';
        this.email = userData.email || '';
        this.phone = userData.phone || '';
        this.password = userData.password || '';
        this.userImage = userData.userImage || '';
        this.role = userData.role || 'USER';
        this.status = userData.status || 'A'; // 'A' for Active, 'I' for Inactive
        this.createdAt = userData.createdAt ? new Date(userData.createdAt) : new Date();
        this.updatedAt = userData.updatedAt ? new Date(userData.updatedAt) : new Date();
    }
  
    /**
     * Verifica si el usuario está activo
     * @returns {boolean} true si el usuario está activo
     */
    isActive() {
        return this.status === 'A';
    }
  
    /**
     * Verifica si el usuario está inactivo
     * @returns {boolean} true si el usuario está inactivo
     */
    isInactive() {
        return this.status === 'I';
    }
  
    /**
     * Obtiene el nombre completo del usuario
     * @returns {string} Nombre completo
     */
    getFullName() {
        return `${this.firstname} ${this.lastname}`.trim();
    }
  
    /**
     * Activa el usuario
     */
    activate() {
        this.status = 'A';
        this.updatedAt = new Date();
    }
  
    /**
     * Desactiva el usuario
     */
    deactivate() {
        this.status = 'I';
        this.updatedAt = new Date();
    }
  
    /**
     * Convierte el usuario a un objeto plano para API calls
     * @returns {Object} Objeto con los datos del usuario
     */
    toJSON() {
        return {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            documentType: this.documentType,
            documentNumber: this.documentNumber,
            email: this.email,
            phone: this.phone,
            password: this.password,
            userImage: this.userImage,
            role: this.role,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
  
    /**
     * Crea una nueva instancia de User con datos mínimos
     * @param {string} firstname - Nombre
     * @param {string} lastname - Apellido
     * @param {string} documentType - Tipo de documento
     * @param {string} documentNumber - Número de documento
     * @param {string} email - Email
     * @param {string} phone - Teléfono
     * @param {string} password - Contraseña
     * @param {string} userImage - Imagen del usuario
     * @param {string} role - Rol del usuario
     * @returns {User} Nueva instancia de User
     */
    static createNew(firstname, lastname, documentType, documentNumber, 
                    email, phone, password, userImage = '', role = 'USER') {
        return new User({
            firstname,
            lastname,
            documentType,
            documentNumber,
            email,
            phone,
            password,
            userImage,
            role,
            status: 'A',
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
  
    /**
     * Valida los datos básicos del usuario
     * @returns {Object} Resultado de la validación {isValid: boolean, errors: string[]}
     */
    validate() {
        const errors = [];
  
        if (!this.firstname || this.firstname.trim().length === 0) {
            errors.push('El nombre es requerido');
        }
  
        if (!this.lastname || this.lastname.trim().length === 0) {
            errors.push('El apellido es requerido');
        }
  
        if (!this.documentType || this.documentType.trim().length === 0) {
            errors.push('El tipo de documento es requerido');
        }
  
        if (!this.documentNumber || this.documentNumber.trim().length === 0) {
            errors.push('El número de documento es requerido');
        }
  
        if (!this.email || this.email.trim().length === 0) {
            errors.push('El email es requerido');
        } else if (!this.isValidEmail(this.email)) {
            errors.push('El formato del email no es válido');
        }
  
        if (!this.phone || this.phone.trim().length === 0) {
            errors.push('El teléfono es requerido');
        }
  
        if (!this.role || this.role.trim().length === 0) {
            errors.push('El rol es requerido');
        }
  
        return {
            isValid: errors.length === 0,
            errors
        };
    }
  
    /**
     * Valida el formato del email
     * @param {string} email - Email a validar
     * @returns {boolean} true si el email es válido
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
  
    /**
     * Actualiza los datos del usuario
     * @param {Object} userData - Nuevos datos del usuario
     */
    update(userData) {
        if (userData.firstname !== undefined) this.firstname = userData.firstname;
        if (userData.lastname !== undefined) this.lastname = userData.lastname;
        if (userData.documentType !== undefined) this.documentType = userData.documentType;
        if (userData.documentNumber !== undefined) this.documentNumber = userData.documentNumber;
        if (userData.email !== undefined) this.email = userData.email;
        if (userData.phone !== undefined) this.phone = userData.phone;
        if (userData.password !== undefined) this.password = userData.password;
        if (userData.userImage !== undefined) this.userImage = userData.userImage;
        if (userData.role !== undefined) this.role = userData.role;
        if (userData.status !== undefined) this.status = userData.status;
        
        this.updatedAt = new Date();
    }
  }
  
  export default User;