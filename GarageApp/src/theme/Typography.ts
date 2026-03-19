import { TextStyle } from 'react-native';

export const Typography = {
    h1: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    } as TextStyle,
    h2: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    } as TextStyle,
    subtitle: {
        fontSize: 16,
        color: '#CCCCCC',
        lineHeight: 22,
    } as TextStyle,
    body: {
        fontSize: 14,
        color: '#FFFFFF',
    } as TextStyle,
    button: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    } as TextStyle,
    link: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E67E22',
    } as TextStyle,
    small: {
        fontSize: 14,
        color: '#888888',
    } as TextStyle,
};

export default Typography;
