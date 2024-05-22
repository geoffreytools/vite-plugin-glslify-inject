import type { Config } from '@jest/types';

export { config as default };

const config: Config.InitialOptions = {
    verbose: true,
    transform: { '^.+\\.(js|ts)$': '@swc/jest' },
    moduleNameMapper: {
        'vite-plugin-glslify-inject/injectConstants': '<rootDir>/src/injectConstants/index.ts',
        '^#lib/(.*)\\.js$': '<rootDir>/src/lib/$1',
        '^(.*)\\.js$': '$1',
    }
};