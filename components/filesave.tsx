import React, { createContext, useContext, useState } from 'react';

export type FileStatus = { path: string; name: string, size: number, mtime: Date | undefined };

const FileProgressContext = createContext<{
    files: FileStatus[] | null;
    addOrUpdateFile: (file: FileStatus) => void;
    removeFile: (path: string) => void;
    reFill: (file: FileStatus[]) => void;
    clearFiles: () => void;
    clear: () => void;
    sortFile: <K extends keyof FileStatus>(key: K, asc?: boolean) => void;
}>({
    files: [],
    addOrUpdateFile: () => { },
    removeFile: () => { },
    clearFiles: () => { },
    reFill: () => { },
    clear: () => { },
    sortFile: () => { },
});
export type fileKey = keyof FileStatus;
export const FileProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [files, setFiles] = useState<FileStatus[] | null>(null);

    const addOrUpdateFile = (file: FileStatus) => {
        setFiles(prev => {
            if (prev == null) return [file];
            const index = prev.findIndex(f => f.path === file.path);

            if (index >= 0) {
                const updated = [...prev];
                updated[index] = { ...updated[index], ...file };
                return updated;
            }
            return [...prev, file];
        });
    };

    const reFill = (file: FileStatus[]) => setFiles(file)

    const removeFile = (path: string) => {
        setFiles(prev => {
            if (!prev) return null;
            const filtered = prev.filter(f => f.path !== path);
            return filtered.length > 0 ? filtered : null;
        });
    };

    const clearFiles = () => setFiles([]);
    const clear = () => setFiles(null);
    const sortFile = <K extends keyof FileStatus>(key: K, asc: boolean = true) => {
        setFiles(prev => {
            if (!prev) return prev;

            const sorted = [...prev].sort((a, b) => {
                const x = a[key];
                const y = b[key];

                if (x == null) return 1;
                if (y == null) return -1;

                if (typeof x === "string" && typeof y === "string") {
                    return asc ? x.localeCompare(y) : y.localeCompare(x);
                }

                if (x instanceof Date && y instanceof Date) {
                    return asc ? x.getTime() - y.getTime() : y.getTime() - x.getTime();
                }

                if (typeof x === "number" && typeof y === "number") {
                    return asc ? x - y : y - x;
                }
                return 0;
            });
            return sorted;
        });
    };
    return (
        <FileProgressContext.Provider value={{ files, addOrUpdateFile, removeFile, clearFiles, clear, sortFile, reFill }}>
            {children}
        </FileProgressContext.Provider>
    );
};

export const useFileProgress = () => useContext(FileProgressContext);

