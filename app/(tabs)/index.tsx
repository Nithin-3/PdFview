import { Dimensions, FlatList, Modal, Pressable, StyleSheet, TouchableOpacity } from 'react-native';

import RNFS from 'react-native-fs';
import ManageExternalStorage from 'react-native-external-storage-permission';

import Pdf from 'react-native-pdf';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFileProgress, fileKey, FileStatus } from '@/components/filesave';
import Drop from '@/components/drop';
import { useRouter } from 'expo-router';
import { ThemedInput } from '@/components/themedInput';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HIGHT = Dimensions.get('window').height;
export default function Index() {
    const { addOrUpdateFile, files, clear, clearFiles, sortFile, reFill } = useFileProgress();
    const borderColor = useThemeColor({ light: undefined, dark: undefined }, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const rout = useRouter();

    const [loc, sloc] = useState({ x: 0, y: 0, path: '' })
    const [mes, smes] = useState(false);

    const reqPer = async () => {
        try {
            const granted = await ManageExternalStorage.checkAndGrantPermission();
            if (granted) {
                clearFiles();
                getFiles();
            } else {
                clear();
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
        let queue = [rootDir];
        while (queue.length > 0) {
            const currentDir: string = queue.shift() || '';
            const items = await RNFS.readDir(`${currentDir}`);
            for (const item of items) {
                if (item.isFile() && item.name.match(/\.(pdf)$/i)) {
                    addOrUpdateFile({ path: item.path, name: item.name, size: item.size, mtime: item.mtime })
                } else if (item.isDirectory()) {
                    if (currentDir.includes('/Android')) continue;
                    if (currentDir.includes('/.')) continue;
                    queue.push(item.path);
                }
            }
        }
        files?.length || addOrUpdateFile({ path: "NA", name: "empty", size: 0, mtime: undefined });
    };
    const search = (t: string) => {
        const term = t.toLowerCase();
        const matches: FileStatus[] = [];
        const others: FileStatus[] = [];

        for (const f of files!) {
            (f.name.toLowerCase().includes(term) ? matches : others).push(f);
        }

        reFill([...matches, ...others]);
    };
    const list = ({ item }: { item: { path: string; name: string } }) => (
        <TouchableOpacity style={[styles.lisTxt, { borderColor }]} onPress={() => { rout.push({ pathname: "/pdf", params: { idx: files?.findIndex(f => f.path === item.path) } }) }} onLongPress={e => { sloc({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, path: `file://${item.path}` }) }} >
            <ThemedText>{item.name.replace(/\.[^/.]+$/, "")}</ThemedText>
        </TouchableOpacity>
    )
    return (
        <ThemedView style={styles.root}>
            <ThemedView style={styles.eventArea} darkColor="#151718">
                <ThemedText style={{ flex: 0.8 }} type="title">List of File</ThemedText>
                <ThemedInput placeholder='search...' onChangeText={search} style={[styles.search, { borderColor }]} placeholderTextColor={borderColor} />
                <ThemedView style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                    <ThemedText>sort by :</ThemedText>
                    <Drop<[fileKey, boolean]> options={[
                        { label: "name asc", value: ["name", true] },
                        { label: "name dec", value: ["name", false] },
                        { label: "size asc", value: ["size", true] },
                        { label: "size dec", value: ["size", false] },
                        { label: "modify time asc", value: ["mtime", true] },
                        { label: "modify time dec", value: ["mtime", false] },
                    ]} placeHolder='none' onChange={v => sortFile(v[0], v[1])} />
                </ThemedView>
            </ThemedView>
            {files == null ? <ThemedView style={styles.loadSceen}>
                <ThemedText>need permission to access storage for read pdf files</ThemedText>
                <TouchableOpacity style={[styles.lisTxt, { borderColor, alignSelf: 'center', margin: 50 }]} onPress={reqPer}><ThemedText>Ask</ThemedText></TouchableOpacity>
            </ThemedView> :
                !files.length ? <ThemedView style={styles.loadSceen}><ThemedText>loading...</ThemedText></ThemedView> :
                    <FlatList data={files} keyExtractor={i => i.path} renderItem={list} contentContainerStyle={{ paddingBottom: 20 }} />
            }
            <Modal visible={loc.x !== 0 && loc.y !== 0} animationType="fade" transparent onRequestClose={() => { sloc({ x: 0, y: 0, path: '' }); smes(false) }} >
                <ThemedView style={{ flex: 1, backgroundColor: '#80808050', }} pointerEvents="box-none" >
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => { sloc({ x: 0, y: 0, path: '' }); smes(false) }} activeOpacity={1} />
                    <ThemedView
                        onLayout={e => {
                            if (mes) return;
                            const width = e.nativeEvent.layout.width / 2;
                            const height = e.nativeEvent.layout.height / 2;
                            let newX = loc.x - width;
                            let newY = loc.y - height;
                            if (newX < 0) newX = 10;
                            if (newY < 0) newY = 30;
                            if (newY + height * 2 > SCREEN_HIGHT) newY = SCREEN_HIGHT - height * 2;
                            if (newX + width * 2 > SCREEN_WIDTH) newX = SCREEN_WIDTH - width * 2;

                            smes(true);
                            sloc(prev => ({
                                ...prev,
                                x: newX,
                                y: newY
                            }));
                        }}
                        style={{ position: 'absolute', left: loc.x, top: loc.y, width: SCREEN_WIDTH * 0.7, height: SCREEN_HIGHT * 0.5, borderWidth: 1, borderColor, borderRadius: 15, overflow: "hidden", }} >
                        {/* <Pressable style={{ height: "100%", width: "100%", position: 'relative', flex: 1 }}> */}
                        <Pdf source={{ uri: `file://${loc.path}` }} style={{ flex: 1, width: '100%', backgroundColor, }} />
                        {/* </Pressable> */}
                    </ThemedView>
                </ThemedView>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, position: "relative" },
    eventArea: { flexDirection: 'row', position: 'relative', padding: 15, paddingTop: 25, justifyContent: "space-between", alignItems: 'center', },
    loadSceen: { flex: 1, justifyContent: "center", alignItems: 'center', },
    lisTxt: { alignSelf: 'flex-start', justifyContent: "center", padding: 7, borderRadius: 15, borderWidth: 1, width: 'auto', },
    search: { borderWidth: 1, maxWidth: 110, minWidth: 80, borderRadius: 10, paddingHorizontal: 10 },
});
