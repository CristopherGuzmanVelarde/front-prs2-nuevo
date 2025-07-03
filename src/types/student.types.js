/**
 * @typedef {Object} Student
 * @property {string} id - ID único del estudiante
 * @property {string} institutionId - ID de la institución
 * @property {string} firstName - Nombre del estudiante
 * @property {string} lastName - Apellido del estudiante
 * @property {string} documentType - Tipo de documento (DNI, CE, PASAPORTE)
 * @property {string} documentNumber - Número de documento
 * @property {string} gender - Género (M/F)
 * @property {Array<number>} birthDate - Fecha de nacimiento [año, mes, día]
 * @property {string} address - Dirección
 * @property {string} phone - Teléfono
 * @property {string} email - Correo electrónico
 * @property {string} nameQr - Nombre para código QR
 * @property {string} status - Estado (A: Activo, I: Inactivo)
 */

/**
 * Crea una nueva instancia de Student con los datos proporcionados
 * @param {Object} data - Datos del estudiante
 * @returns {Student} Nueva instancia de Student
 */
export class Student {
    constructor(data) {
        this.id = data.id;
        this.institutionId = data.institutionId;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.documentType = data.documentType;
        this.documentNumber = data.documentNumber;
        this.gender = data.gender;
        this.birthDate = data.birthDate;
        this.address = data.address;
        this.phone = data.phone;
        this.email = data.email;
        this.nameQr = data.nameQr;
        this.status = data.status;
    }
}

export const StudentStatus = {
    ACTIVE: 'A',
    INACTIVE: 'I'
};

export const DocumentType = {
    DNI: 'DNI',
    CE: 'CE',
    PASSPORT: 'PASAPORTE'
};

export const Gender = {
    MALE: 'M',
    FEMALE: 'F'
}; 