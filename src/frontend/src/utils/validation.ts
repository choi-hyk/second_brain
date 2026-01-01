export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^\S{8,64}$/;
export const NAME_REGEX = /^[A-Za-z0-9\uAC00-\uD7A3][A-Za-z0-9\uAC00-\uD7A3 _.-]{1,29}$/;

export const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim());
export const isValidPassword = (value: string) => {
    if (!PASSWORD_REGEX.test(value)) return false;
    const hasUpper = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    return hasUpper && hasDigit && hasSpecial;
};
export const isValidName = (value: string) => NAME_REGEX.test(value.trim());
