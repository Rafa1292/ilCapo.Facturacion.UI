
export interface CustomInputAttributes {
    label: string;
    name: string;
    pattern: string;
    validationMessage: string;
    handleChange: (event: any) => void;
}