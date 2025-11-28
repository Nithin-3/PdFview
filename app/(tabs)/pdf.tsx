import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import Pdf from 'react-native-pdf';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useFileProgress } from '@/components/filesave';
import { memo, useEffect, useRef, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedInput } from '@/components/themedInput';
import { searchWord } from '@/constants/pdf';
const PDFViewer = () => {
    const borderColor = useThemeColor({}, 'text');
    const { files } = useFileProgress()
    const { idx } = useLocalSearchParams<{ idx: string }>();
    const backgroundColor = useThemeColor({}, 'background');
    const navigation = useNavigation();

    const [path, spath] = useState(files![parseInt(idx)].path)
    const [search, ssearch] = useState('')

    const pdf = useRef<any>(null);

    useEffect(() => {
        navigation.setOptions({
            title: files![files!.findIndex(f => f.path === path)].name
        })
    }, [path, navigation, files])


    useEffect(() => {
        if (!search || search.trim() === "") return;

        let cancelled = false;

        const runSearch = async () => {
            // const result = await searchWord(path, search);

            if (cancelled) return;

            // if (result.length === 0) return;

            // const first = result[0];
            // pdf.current?.setPage(first.page);
        };

        // runSearch();


        pdf.current?.setPage(search.length);


        return () => {
            cancelled = true;
        };
    }, [search, path]);

    const move = (direction: 1 | -1) => {
        spath(p => {
            const idx = files!.findIndex(f => f.path === p) + direction
            return files![(idx < 0) ? files!.length - 1 : idx >= files!.length ? 0 : idx].path
        })
    }
    return (
        <ThemedView style={{ flex: 1, position: 'relative' }}>
            <ThemedInput value={search} onChangeText={ssearch} placeholder='search word...' />
            <Pdf ref={pdf} source={{ uri: `file://${path}` }} style={{ flex: 1, backgroundColor, width: "100%" }} />
            <ThemedView style={styles.eventArea}>
                <TouchableOpacity style={[styles.btn, { borderColor }]} onPress={() => move(-1)}>
                    <ThemedText>{"<"}</ThemedText>
                </TouchableOpacity>
            </ThemedView>
            <ThemedView style={[styles.eventArea, { right: 0 }]}>
                <TouchableOpacity style={[styles.btn, { borderColor }]} onPress={() => move(1)}>
                    <ThemedText>{">"}</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );
};
const styles = StyleSheet.create({
    eventArea: {
        flexDirection: 'row', position: 'absolute', top: "50%", transform: [
            { translateY: -50 },
        ], backgroundColor: "transparent",
    },
    btn: { padding: 10, borderRadius: 50, borderWidth: 1, justifyContent: "center", alignItems: 'center', backgroundColor: "#808080", opacity: 0.5 }
})

export default PDFViewer;
