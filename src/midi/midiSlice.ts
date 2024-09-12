import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { AppThunk } from '../app/store';
import { WebMidi } from 'webmidi';

export interface MidiInput {
  id: string;
  name: string;
}

export interface MidiState {
  isEnabled: boolean;
  inputs: MidiInput[];
  activeInputID: string;
}

const initialState: MidiState = {
  isEnabled: false,
  inputs: [],
  activeInputID: '',
};

export const midiSlice = createSlice({
  name: 'midi',
  initialState,
  reducers: {
    setMidiStatus: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    setMidiInputs: (state, action: PayloadAction<MidiInput[]>) => {
      state.inputs = action.payload;
    },
    setActiveInput: (state, action: PayloadAction<string>) => {
      state.inputs.forEach(({ id }) => {
        const input = WebMidi.getInputById(id);
        if (input) {
          input.removeListener(); // 移除旧的监听器
        }
      });
      state.activeInputID = action.payload;
    },
  },
});

export const { setMidiStatus, setMidiInputs, setActiveInput } = midiSlice.actions;

export const getMidiStatus = (state: RootState) => state.midi.isEnabled;
export const getMidiInputs = (state: RootState) => state.midi.inputs;
export const getActiveMidiInput = (state: RootState) => state.midi.activeInputID;

export const enableMidi = (): AppThunk => async (dispatch) => {
  if (!navigator.requestMIDIAccess) return;

  try {
    await WebMidi.enable();
    dispatch(setMidiStatus(WebMidi.enabled));

    if (WebMidi.enabled) {
      const fromMax = WebMidi.getInputByName('from Max 1')?.id || false;
      dispatch(
        setMidiInputs(
          WebMidi.inputs.map(({ id, name }) => ({ id, name }))
        )
      );

      const defaultInputID = WebMidi.inputs.length > 0 ? WebMidi.inputs[0].id : '';
      dispatch(setActiveInput(fromMax || defaultInputID));
    }
  } catch (error) {
    console.error('Failed to enable WebMIDI:', error);
    dispatch(setMidiStatus(false));
  }
};

export default midiSlice.reducer;
