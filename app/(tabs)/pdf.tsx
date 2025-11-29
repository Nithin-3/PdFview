import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import Pdf from 'react-native-pdf';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useFileProgress } from '@/components/filesave';
import { useEffect, useRef, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
// import { ThemedInput } from '@/components/themedInput';
// import { searchWord } from '@/constants/pdf';
import Drop from '@/components/drop';
const PDFViewer = () => {
    const borderColor = useThemeColor({}, 'text');
    const { files } = useFileProgress()
    const { idx } = useLocalSearchParams<{ idx: string }>();
    const backgroundColor = useThemeColor({}, 'background');
    const navigation = useNavigation();

    const [path, spath] = useState(files![parseInt(idx)].path)
    // const [search, ssearch] = useState('')
    const [range, srange] = useState(0);
    const [pag, spag] = useState(1)

    const pdf = useRef<any>(null);

    useEffect(() => {
        navigation.setOptions({
            title: files![files!.findIndex(f => f.path === path)].name
        })
    }, [path, navigation, files])


    // useEffect(() => {
    // if (!search || search.trim() === "") return;

    // let cancelled = false;
    //
    // const runSearch = async () => {
    //     // const result = await searchWord(path, search);
    //
    //     if (cancelled) return;
    //
    //     // if (result.length === 0) return;
    //
    //     // const first = result[0];
    //     // pdf.current?.setPage(first.page);
    // };
    //
    // runSearch();


    // pdf.current?.setPage(search.length);


    // return () => {
    //     cancelled = true;
    // };
    // }, [search, path]);

    const move = (direction: 1 | -1) => {
        spath(p => {
            const idx = files!.findIndex(f => f.path === p) + direction
            return files![(idx < 0) ? files!.length - 1 : idx >= files!.length ? 0 : idx].path
        })
    }
    const generateRange = (n: number) => {
        return Array.from({ length: n }, (_, i) => ({
            label: String(i + 1),
            value: i + 1,
        }));
    };
    return (
        <ThemedView style={{ flex: 1, position: 'relative' }}>
            {/* <ThemedInput value={search} onChangeText={ssearch} placeholder='search word...' /> */}
            <Pdf ref={pdf} source={{ uri: `file://${path}` }} style={{ flex: 1, backgroundColor, width: "100%" }} onLoadComplete={srange} onPageChanged={(p, _t) => spag(p)} />
            <ThemedView style={styles.eventArea}>
                <TouchableOpacity style={[styles.btn, { borderColor }]} onPress={() => move(-1)}>
                    <ThemedText>{"<"}</ThemedText>
                </TouchableOpacity>
            </ThemedView>
            <ThemedView style={styles.pageBtn}>
                <Drop<number> options={generateRange(range)} value={pag} onChange={v => { pdf.current?.setPage(v); spag(v) }} />
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
        position: 'absolute', top: "50%", transform: [
            { translateY: -50 },
        ], backgroundColor: "transparent",
    },
    pageBtn: { position: "absolute", bottom: 20, right: 3, backgroundColor: "transparent", opacity: 0.5 },
    btn: { padding: 10, borderRadius: 50, borderWidth: 1, justifyContent: "center", alignItems: 'center', backgroundColor: "#808080", opacity: 0.5 }
})

export default PDFViewer;
