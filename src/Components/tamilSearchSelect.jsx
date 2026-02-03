import { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { getTransliterateSuggestions } from "@ai4bharat/indic-transliterate";

const TamilSearchSelect = ({ value, onChange, options, noOptionsMessage, styles }) => {
    const [inputValue, setInputValue] = useState("");
    const [taSuggestions, setTaSuggestions] = useState([]);
    const reqIdRef = useRef(0);

    // Keep inputValue in sync with react-select typing
    const handleInputChange = (newValue, actionMeta) => {
        // Only run transliteration logic when user types
        if (actionMeta?.action !== "input-change") return newValue;

        setInputValue(newValue);
        return newValue; // important: keep react-select input stable
    };

    // Fetch transliteration suggestions when input changes
    useEffect(() => {
        const word = inputValue?.trim();
        if (!word) {
            setTaSuggestions([]);
            return;
        }

        const myReqId = ++reqIdRef.current;

        getTransliterateSuggestions(word, {
            lang: "ta",
            numOptions: 5,
            showCurrentWordAsLastSuggestion: false,
        })
            .then((data) => {
                // Ignore stale responses (race condition when typing fast)
                if (myReqId !== reqIdRef.current) return;

                // Library typically returns an array, but handle both safely
                const list = Array.isArray(data) ? data : data?.suggestions;
                setTaSuggestions(Array.isArray(list) ? list : []);
            })
            .catch((e) => {
                if (myReqId !== reqIdRef.current) return;
                console.error("Transliteration error:", e);
                setTaSuggestions([]);
            });
    }, [inputValue]);

    const normalizeLatin = (str = "") =>
        String(str).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    const filterLogic = (option, rawInput) => {
        if (!rawInput) return true;

        const label = (option.label || "").normalize("NFC");
        const raw = String(rawInput).normalize("NFC");

        // English-to-English search (for English labels)
        const enLabel = normalizeLatin(label);
        const enInput = normalizeLatin(raw);

        // English -> Tamil transliteration match (for Tamil labels)
        const taHit = taSuggestions.some((s) => label.includes(String(s).normalize("NFC")));

        return (
            (enInput && enLabel.includes(enInput)) || // English label match
            label.includes(raw) ||                    // Direct Tamil typing match
            taHit                                   // Roman typing -> Tamil label match
        );
    };

    return (
        <Select
            value={value}
            onChange={onChange}
            options={options}
            styles={styles}
            isSearchable
            placeholder="Type to search"
            inputValue={inputValue}
            onInputChange={handleInputChange}
            filterOption={filterLogic}
            noOptionsMessage={noOptionsMessage}
        />
    );
};

export default TamilSearchSelect;
