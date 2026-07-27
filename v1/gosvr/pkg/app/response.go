package app

import (
	"encoding/json"
	"net/http"
)

type Envelope map[string]interface{}

// WriteJSON sends a strongly typed JSON response with status code.
func WriteJSON(w http.ResponseWriter, status int, data Envelope, headers http.Header) error {
	js, err := json.Marshal(data)
	if err != nil {
		return err
	}

	js = append(js, '\n')

	for key, value := range headers {
		w.Header()[key] = value
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, err = w.Write(js)
	return err
}

// ErrorJSON standardizes API error reporting payloads.
func ErrorJSON(w http.ResponseWriter, status int, message string) error {
	env := Envelope{"error": message}
	return WriteJSON(w, status, env, nil)
}
