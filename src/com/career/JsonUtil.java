package com.career;

import java.util.*;

/**
 * JsonUtil — a small, dependency-free JSON parser and writer.
 *
 * Parses JSON into plain java.util.Map / java.util.List / String /
 * Double / Boolean / null and writes Java objects back to JSON.
 */
public final class JsonUtil {

    private JsonUtil() {
    }

    // ---------------------------------------------------------------
    // Parsing
    // ---------------------------------------------------------------

    public static Object parse(String json) {
        if (json == null) {
            return null;
        }

        Parser p = new Parser(json);
        p.skipWhitespace();

        Object value = p.parseValue();

        p.skipWhitespace();

        return value;
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseObject(String json) {
        Object value = parse(json);

        if (value instanceof Map) {
            return (Map<String, Object>) value;
        }

        return new LinkedHashMap<>();
    }

    private static final class Parser {

        private final String s;
        private int i;
        private final int len;

        Parser(String s) {
            this.s = s;
            this.i = 0;
            this.len = s.length();
        }

        void skipWhitespace() {
            while (i < len && Character.isWhitespace(s.charAt(i))) {
                i++;
            }
        }

        Object parseValue() {
            skipWhitespace();

            if (i >= len) {
                throw new RuntimeException(
                    "Unexpected end of JSON input"
                );
            }

            char c = s.charAt(i);

            switch (c) {

                case '{':
                    return parseObjectInternal();

                case '[':
                    return parseArray();

                case '"':
                    return parseString();

                case 't':
                case 'f':
                    return parseBoolean();

                case 'n':
                    return parseNull();

                default:
                    return parseNumber();
            }
        }

        Map<String, Object> parseObjectInternal() {

            Map<String, Object> map =
                new LinkedHashMap<>();

            expect('{');

            skipWhitespace();

            if (peek() == '}') {
                i++;
                return map;
            }

            while (true) {

                skipWhitespace();

                String key = parseString();

                skipWhitespace();

                expect(':');

                Object value = parseValue();

                map.put(key, value);

                skipWhitespace();

                char next = peek();

                if (next == ',') {
                    i++;
                    continue;
                }

                if (next == '}') {
                    i++;
                    break;
                }

                throw new RuntimeException(
                    "Malformed JSON object near index " + i
                );
            }

            return map;
        }

        List<Object> parseArray() {

            List<Object> list =
                new ArrayList<>();

            expect('[');

            skipWhitespace();

            if (peek() == ']') {
                i++;
                return list;
            }

            while (true) {

                Object value = parseValue();

                list.add(value);

                skipWhitespace();

                char next = peek();

                if (next == ',') {
                    i++;
                    continue;
                }

                if (next == ']') {
                    i++;
                    break;
                }

                throw new RuntimeException(
                    "Malformed JSON array near index " + i
                );
            }

            return list;
        }

        String parseString() {

            expect('"');

            StringBuilder sb =
                new StringBuilder();

            while (true) {

                if (i >= len) {
                    throw new RuntimeException(
                        "Unterminated JSON string"
                    );
                }

                char c = s.charAt(i++);

                if (c == '"') {
                    break;
                }

                if (c == '\\') {

                    if (i >= len) {
                        throw new RuntimeException(
                            "Unterminated JSON escape"
                        );
                    }

                    char esc = s.charAt(i++);

                    switch (esc) {

                        case '"':
                            sb.append('"');
                            break;

                        case '\\':
                            sb.append('\\');
                            break;

                        case '/':
                            sb.append('/');
                            break;

                        case 'b':
                            sb.append('\b');
                            break;

                        case 'f':
                            sb.append('\f');
                            break;

                        case 'n':
                            sb.append('\n');
                            break;

                        case 'r':
                            sb.append('\r');
                            break;

                        case 't':
                            sb.append('\t');
                            break;

                        case 'u':

                            if (i + 4 > len) {
                                throw new RuntimeException(
                                    "Bad unicode escape"
                                );
                            }

                            String hex =
                                s.substring(i, i + 4);

                            sb.append(
                                (char) Integer.parseInt(hex, 16)
                            );

                            i += 4;

                            break;

                        default:

                            throw new RuntimeException(
                                "Bad escape char: " + esc
                            );
                    }

                } else {

                    sb.append(c);
                }
            }

            return sb.toString();
        }

        Boolean parseBoolean() {

            if (s.startsWith("true", i)) {
                i += 4;
                return Boolean.TRUE;
            }

            if (s.startsWith("false", i)) {
                i += 5;
                return Boolean.FALSE;
            }

            throw new RuntimeException(
                "Malformed boolean near index " + i
            );
        }

        Object parseNull() {

            if (s.startsWith("null", i)) {
                i += 4;
                return null;
            }

            throw new RuntimeException(
                "Malformed literal near index " + i
            );
        }

        Double parseNumber() {

            int start = i;

            if (peek() == '-') {
                i++;
            }

            while (
                i < len &&
                Character.isDigit(s.charAt(i))
            ) {
                i++;
            }

            if (
                i < len &&
                s.charAt(i) == '.'
            ) {

                i++;

                while (
                    i < len &&
                    Character.isDigit(s.charAt(i))
                ) {
                    i++;
                }
            }

            if (
                i < len &&
                (
                    s.charAt(i) == 'e' ||
                    s.charAt(i) == 'E'
                )
            ) {

                i++;

                if (
                    i < len &&
                    (
                        s.charAt(i) == '+' ||
                        s.charAt(i) == '-'
                    )
                ) {
                    i++;
                }

                while (
                    i < len &&
                    Character.isDigit(s.charAt(i))
                ) {
                    i++;
                }
            }

            if (i == start) {

                throw new RuntimeException(
                    "Malformed number near index " + i
                );
            }

            return Double.parseDouble(
                s.substring(start, i)
            );
        }

        char peek() {

            if (i >= len) {
                throw new RuntimeException(
                    "Unexpected end of JSON input"
                );
            }

            return s.charAt(i);
        }

        void expect(char c) {

            if (
                i >= len ||
                s.charAt(i) != c
            ) {

                throw new RuntimeException(
                    "Expected '" + c +
                    "' near index " + i
                );
            }

            i++;
        }
    }

    // ---------------------------------------------------------------
    // Writing
    // ---------------------------------------------------------------

    public static String write(Object value) {

        StringBuilder sb =
            new StringBuilder();

        writeValue(value, sb);

        return sb.toString();
    }

    /*
     * Compatibility method used by AssessmentServlet.
     */
    public static String stringify(
        Map<String, Object> map
    ) {
        return write(map);
    }

    @SuppressWarnings("unchecked")
    private static void writeValue(
        Object value,
        StringBuilder sb
    ) {

        if (value == null) {

            sb.append("null");

        } else if (value instanceof String) {

            writeString(
                (String) value,
                sb
            );

        } else if (value instanceof Map) {

            writeObject(
                (Map<String, Object>) value,
                sb
            );

        } else if (value instanceof List) {

            writeArray(
                (List<Object>) value,
                sb
            );

        } else if (value instanceof Boolean) {

            sb.append(value.toString());

        } else if (value instanceof Number) {

            double d =
                ((Number) value).doubleValue();

            if (
                d == Math.floor(d) &&
                !Double.isInfinite(d)
            ) {

                sb.append((long) d);

            } else {

                sb.append(d);
            }

        } else {

            writeString(
                value.toString(),
                sb
            );
        }
    }

    private static void writeObject(
        Map<String, Object> map,
        StringBuilder sb
    ) {

        sb.append('{');

        boolean first = true;

        for (
            Map.Entry<String, Object> entry :
            map.entrySet()
        ) {

            if (!first) {
                sb.append(',');
            }

            first = false;

            writeString(
                entry.getKey(),
                sb
            );

            sb.append(':');

            writeValue(
                entry.getValue(),
                sb
            );
        }

        sb.append('}');
    }

    private static void writeArray(
        List<Object> list,
        StringBuilder sb
    ) {

        sb.append('[');

        boolean first = true;

        for (Object item : list) {

            if (!first) {
                sb.append(',');
            }

            first = false;

            writeValue(
                item,
                sb
            );
        }

        sb.append(']');
    }

    private static void writeString(
        String s,
        StringBuilder sb
    ) {

        sb.append('"');

        for (int i = 0; i < s.length(); i++) {

            char c = s.charAt(i);

            switch (c) {

                case '"':
                    sb.append("\\\"");
                    break;

                case '\\':
                    sb.append("\\\\");
                    break;

                case '\n':
                    sb.append("\\n");
                    break;

                case '\r':
                    sb.append("\\r");
                    break;

                case '\t':
                    sb.append("\\t");
                    break;

                default:

                    if (c < 0x20) {

                        sb.append(
                            String.format(
                                "\\u%04x",
                                (int) c
                            )
                        );

                    } else {

                        sb.append(c);
                    }
            }
        }

        sb.append('"');
    }

    // ---------------------------------------------------------------
    // Typed-access helpers
    // ---------------------------------------------------------------

    public static String getString(
        Map<String, Object> map,
        String key
    ) {

        Object v = map.get(key);

        return v == null
            ? null
            : v.toString();
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> getObject(
        Map<String, Object> map,
        String key
    ) {

        Object v = map.get(key);

        return (v instanceof Map)
            ? (Map<String, Object>) v
            : null;
    }

    /*
     * Compatibility method used by AssessmentServlet.
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> getMap(
        Map<String, Object> map,
        String key
    ) {

        Object v = map.get(key);

        return (v instanceof Map)
            ? (Map<String, Object>) v
            : null;
    }

    @SuppressWarnings("unchecked")
    public static List<Object> getArray(
        Map<String, Object> map,
        String key
    ) {

        Object v = map.get(key);

        return (v instanceof List)
            ? (List<Object>) v
            : null;
    }

    public static Double getNumber(
        Map<String, Object> map,
        String key
    ) {

        Object v = map.get(key);

        return (v instanceof Number)
            ? ((Number) v).doubleValue()
            : null;
    }
}