// This utility file provides validation functions.

export const isRequired = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  };
  
  export const minLength = (value, min) => {
    return value.length >= min;
  };
  
  export const maxLength = (value, max) => {
    return value.length <= max;
  };
  
  // Allows letters, accented letters, ñ, spaces, hyphens and apostrophes
  export const isAlphabetic = (value) => {
    // This regex is the key fix: It includes accented characters and ñ.
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/;
    return regex.test(value);
  };
  
  // Cleans multiple spaces and trims leading/trailing spaces
  export const cleanSpaces = (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\s+/g, ' ').trim();
  };
  
  // Cleans multiple internal spaces but does NOT trim.
  export const cleanInternalSpaces = (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\s+/g, ' ');
  };
  
  
  // Capitalizes the first letter of each word
  export const capitalize = (value) => {
    if (typeof value !== 'string') return value;
    return value.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Validate a name field
  export const validateName = (name, fieldName = 'Campo') => {
    let error = '';
    const cleanedName = cleanSpaces(name);
  
    if (!isRequired(cleanedName)) {
      error = `${fieldName} es obligatorio.`;
    } else if (!minLength(cleanedName, 2)) {
      error = `${fieldName} debe tener al menos 2 caracteres.`;
    } else if (!maxLength(cleanedName, 100)) {
      error = `${fieldName} no debe exceder los 100 caracteres.`;
    } else if (!isAlphabetic(cleanedName)) {
      error = `${fieldName} solo debe contener letras y los caracteres permitidos (espacios, ', -).`;
    }
  
    return error;
  };
  
  // Basic email format validation
  export const isValidEmailFormat = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // Validate an email field
  export const validateEmail = (email, fieldName = 'Email') => {
    let error = '';
    const cleanedEmail = cleanSpaces(email);
  
    if (!isRequired(cleanedEmail)) {
      error = `${fieldName} es obligatorio.`;
    } else if (!isValidEmailFormat(cleanedEmail)) {
       error = `${fieldName} no tiene un formato válido.`;
    }
  
    return error;
  };
  
  // Validate a phone number field with specific formatting
  export const validatePhone = (phone, fieldName = 'Teléfono', required = false) => {
      let error = '';
      const phoneString = String(phone || '');
  
      if (required && phoneString.trim() === '') {
          return `${fieldName} es obligatorio.`;
      }
  
      if (phoneString.trim() !== '') {
          const allowedCharsRegex = /^[0-9\s-]+$/;
          if (!allowedCharsRegex.test(phoneString)) {
              error = `${fieldName} solo debe contener dígitos, espacios o guiones.`;
              return error;
          }
  
          const justDigits = phoneString.replace(/\s|-/g, '');
          if (justDigits.length !== 9) {
               error = `${fieldName} no tiene un formato válido. Use 9 dígitos.`;
               return error;
          }
      }
  
      return error;
  };
  
  
  // Validate a username field
  export const validateUserName = (username, fieldName = 'Usuario', required = true) => {
      let error = '';
      const usernameString = String(username || '');
  
      if (required && usernameString.trim() === '') {
          return `${fieldName} es obligatorio.`;
      }
  
      if (!required && usernameString.trim() === '') {
          return '';
      }
  
      const allowedCharsRegex = /^[a-zA-Z0-9_.]+$/;
      if (!allowedCharsRegex.test(usernameString)) {
          error = `${fieldName} solo debe contener letras, números, guiones bajos (_) o puntos (.).`;
          return error;
      }
  
       if (usernameString.includes(' ')) {
            error = `${fieldName} no debe contener espacios.`;
            return error;
       }
  
      if (usernameString.startsWith('.') || usernameString.startsWith('_') || usernameString.endsWith('.') || usernameString.endsWith('_')) {
          error = `${fieldName} no debe empezar ni terminar con punto (.) o guion bajo (_).`;
          return error;
      }
  
       if (usernameString.includes('..') || usernameString.includes('__') || usernameString.includes('._') || usernameString.includes('_.') ) {
            error = `${fieldName} no debe contener puntos (.) o guiones bajos (_) consecutivos.`;
            return error;
       }
  
      return error;
  };
  
  // Validate a document type field
  export const validateDocumentType = (documentType, fieldName = 'Tipo de Documento', required = true) => {
      let error = '';
      const docTypeString = String(documentType || '');
  
      if (required && docTypeString.trim() === '') {
          return `${fieldName} es obligatorio.`;
      }
  
      if (!required && docTypeString.trim() === '') {
          return '';
      }
  
      const allowedTypes = ['DNI', 'CNE', 'PASSPORT'];
      if (!allowedTypes.includes(docTypeString)) {
          error = `${fieldName} tiene un valor inválido.`;
          return error;
      }
  
      return error;
  };
  
  // Validate a document number field based on document type
  export const validateDocumentNumber = (documentNumber, documentType, fieldName = 'Número de Documento', required = true) => {
      let error = '';
      const docNumberString = String(documentNumber || '').trim();
  
      if (required && docNumberString === '') {
          return `${fieldName} es obligatorio.`;
      }
  
      if (!required && docNumberString === '') {
          return '';
      }
  
      if (documentType === 'DNI') {
          const digitsOnlyRegex = /^[0-9]+$/;
          if (!digitsOnlyRegex.test(docNumberString)) {
              return `${fieldName} (DNI) solo debe contener dígitos.`;
          }
          if (docNumberString.length !== 8) {
              return `${fieldName} (DNI) debe tener exactamente 8 dígitos.`;
          }
      } else if (documentType === 'CNE') {
          const digitsOnlyRegex = /^[0-9]+$/;
          if (!digitsOnlyRegex.test(docNumberString)) {
              return `${fieldName} (CNE) solo debe contener dígitos.`;
          }
          if (docNumberString.length !== 20) {
              return `${fieldName} (CNE) debe tener exactamente 20 dígitos.`;
          }
      } else if (documentType === 'PASSPORT') {
          const passportRegex = /^E\d{8}$/i; // Case-insensitive E
          if (!passportRegex.test(docNumberString)) {
              return `${fieldName} (Pasaporte) debe empezar con 'E' seguido de 8 dígitos.`;
          }
      } else {
          if (required) {
             return 'Seleccione un Tipo de Documento válido para validar el número.';
          }
      }
  
      return error;
  };
  
  // Validate Institution ID field
  export const validateInstitutionId = (value, fieldName = 'ID Institución') => {
      let error = '';
      const valueString = String(value || '').trim();
  
      if (!isRequired(valueString)) {
          error = `${fieldName} es obligatorio.`;
          return error;
      }
      
      return error;
  };
  
  
  // Validate a password field
  export const validatePassword = (password, fieldName = 'Contraseña', required = true) => {
      let error = '';
      const passwordString = String(password || '').trim();
  
      if (required && !isRequired(passwordString)) {
          error = `${fieldName} es obligatorio.`;
          return error;
      }
  
      if (passwordString !== '') {
          if (!minLength(passwordString, 8)) {
              error = `${fieldName} debe tener al menos 8 caracteres.`;
              return error;
          }
      }
  
      return error;
  };
  