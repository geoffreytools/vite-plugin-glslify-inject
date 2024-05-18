import type { Config } from '@jest/types';

export { config as default };

const config: Config.InitialOptions = {
    verbose: true,
    transform: {
        '^.+\\.(js|ts)$': 'ts-jest',
    },
    moduleNameMapper: {
        'vite-plugin-glslify-inject/inject': '<rootDir>/src/inject.ts',
        '^(.*)\\.js$': '$1'
    }
};