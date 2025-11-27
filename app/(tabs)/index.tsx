import { StyleSheet, TouchableOpacity } from 'react-native';

import RNFS from 'react-native-fs';
import ManageExternalStorage from 'react-native-external-storage-permission';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect } from 'react';

export default function HomeScreen() {
    const reqPer = async () => {
        try {
            const granted = await ManageExternalStorage.checkAndGrantPermission();
            if (granted) {
                getFiles();
            } else {
            }
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        reqPer()
    }, []);
    const getFiles = async () => {
        const rootDir = RNFS.ExternalStorageDirectoryPath;
        let files = [];
        let queue = [rootDir];
        while (queue.length > 0) {
            const currentDir: string = queue.shift() || '';
            const items = await RNFS.readDir(`${currentDir}`);
            for (const item of items) {
                if (item.isFile() && item.name.match(/\.(pdf)$/i)) {
                    files.push({ path: item.path, name: item.name });
                } else if (item.isDirectory()) {
                    if (currentDir.includes('/Android')) continue;
                    if (currentDir.includes('/.')) continue;
                    queue.push(item.path);
                }
            }
        }
        files.length || files.push({ path: "NA", name: "empty" })
        // setfile(files)

    };
    return (
        <ThemedView>
            <ThemedView style={styles.eventArea} darkColor="#151718">
                <ThemedText style={{ flex: 0.8 }} type="title">List of File</ThemedText>
                <TouchableOpacity onPress={() => { }} style={{ flex: 0.1 }}><ThemedText>theme</ThemedText></TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, position: "relative", },
    eventArea: { flexDirection: 'row', position: 'relative', padding: 15, paddingTop: 25, justifyContent: "space-between", alignItems: 'center', },
    loadSceen: { flex: 1, justifyContent: "center", alignItems: 'center', },
    lisTxt: { alignSelf: 'flex-start', justifyContent: "center", padding: 7, borderRadius: 15, borderWidth: 1, width: 'auto', },
    allert: { margin: 20, borderRadius: 12, padding: 20, elevation: 5, },
    buttonViw: { flexDirection: 'row', justifyContent: 'space-between' }
});
