package com.hcs.pos;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import org.json.JSONArray;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;


@NativePlugin(
        requestCodes = Pos.REQUEST_BLUETOOTH
)
public class Pos extends Plugin {

    protected static final int REQUEST_BLUETOOTH = 123;
    private static final String TAG = Pos.class.getSimpleName();
    private BluetoothSocket mmSocket;
    private BluetoothDevice mmDevice;
    private OutputStream mmOutputStream;
    private InputStream mmInputStream;

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", value);
        call.success(ret);
    }

    @PluginMethod
    public void getBT(PluginCall call) {
        String value = call.getString("value");
        saveCall(call);
        pluginRequestPermission(Manifest.permission.BLUETOOTH, REQUEST_BLUETOOTH);

    }

    @PluginMethod
    public void connectBT(PluginCall call) {
        String value = call.getString("value");
//        saveCall(call);
        try {
            connect(call);
        } catch (Exception e) {

        }
    }

    private void connect(PluginCall call) throws Exception {
        try {
            String btName = call.getString("value");
            for (BluetoothDevice device : BluetoothAdapter.getDefaultAdapter().getBondedDevices()) {
                mmDevice = (device.getName().equals(btName)) ? device : null;
            }
            if (mmDevice == null) {
                Log.d(TAG, "connect: No device found");
                return;
            }
            // Standard SerialPortService ID
            UUID uuid = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");
            mmSocket = mmDevice.createRfcommSocketToServiceRecord(uuid);
            if (mmOutputStream == null) {
                mmSocket.connect();
                mmOutputStream = mmSocket.getOutputStream();
                mmInputStream = mmSocket.getInputStream();
            }

            sendData(null, "");
            call.success(new JSObject().put("response", "Connected successfully"));

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PluginMethod
    public void printBT(PluginCall call) {
        if (call.getString("value").isEmpty()) {
            return;
        }
        try {

            if (mmSocket != null) {
//                printImage(call, base64);
                printHtml(call, call.getString("value"));
//                sendData(call, call.getString("value"));
            } else {
                call.reject("Printer not connected");
            }
//            return;
        } catch (Exception e) {
            e.printStackTrace();
            call.reject("Printer not connected");
        }

    }


    private void sendData(PluginCall call, String data) {
        byte[] CutPaper = {0x1B, 0x69};
        try {
            mmOutputStream.write(data.getBytes());
            mmOutputStream.write(String.valueOf("\n\n\n\n\n").getBytes());
            mmOutputStream.write(0x1D);
            mmOutputStream.write(86);
            mmOutputStream.write(48);
            mmOutputStream.write(0);
            if (call != null) {
                call.success(new JSObject().put("response", "print successfully"));
            }
        } catch (IOException e) {
            e.printStackTrace();
            if (call != null) {
                call.reject("Something went wrong");
            }
        }
    }


    @Override
    protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.handleRequestPermissionsResult(requestCode, permissions, grantResults);
        PluginCall call = getSavedCall();
        if (call == null) {
            Log.d(TAG, "handleRequestPermissionsResult: ");
            return;
        }
        for (int result : grantResults) {
            if (result == PackageManager.PERMISSION_DENIED) {
                Log.d(TAG, "handleRequestPermissionsResult: Permission rejected by user");
                call.reject("Permission denied");
                return;
            }
        }
        if (requestCode == Pos.REQUEST_BLUETOOTH) {
            loadBluetooth(call);
        }
    }

    private void loadBluetooth(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        Set<BluetoothDevice> list = adapter.getBondedDevices();
        List<Map> mapList = new ArrayList<>();
        if (list.size() > 0) {
            for (BluetoothDevice device : list) {
                Map<String, String> map = new HashMap<>();
                map.put("id", device.getAddress());
                map.put("name", device.getName());
                mapList.add(map);
            }
            JSObject ret = new JSObject();
            ret.put("response", new JSONArray(mapList));
            call.success(ret);
        } else {
            call.reject("No bluetooth found");
        }
    }

    public static byte[] concat(byte[] a, byte[] b) {
        int lenA = a.length;
        int lenB = b.length;
        byte[] c = Arrays.copyOf(a, lenA + lenB);
        System.arraycopy(b, 0, c, lenA, lenB);
        return c;
    }
    void printHtml(PluginCall call, String html) throws IOException {
        try {
            if (!html.contains("pagecutter")) {
                final String encodedString = html;
                final String pureBase64Encoded = encodedString.substring(encodedString.indexOf(",") + 1);
                final byte[] decodedBytes = Base64.decode(pureBase64Encoded, Base64.NO_WRAP);
                Bitmap decodedBitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
                mmOutputStream.write(Utils.decodeBitmap(decodedBitmap));
            } else {
                mmOutputStream.write(String.valueOf("\n\n\n\n\n").getBytes());
                mmOutputStream.write(0x1D);
                mmOutputStream.write(86);
                mmOutputStream.write(48);
                mmOutputStream.write(0);
            }
            if (call != null) {
                call.success(new JSObject().put("response", "print successfully"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            if (call != null) {
                call.reject("Something went wrong");
            }
        }
    }

    boolean printImage(PluginCall call, String msg) throws IOException {
        try {

            final String encodedString = msg;
            final String pureBase64Encoded = encodedString.substring(encodedString.indexOf(",") + 1);


            final byte[] decodedBytes = Base64.decode(pureBase64Encoded, Base64.NO_WRAP);

            Bitmap decodedBitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);

            Bitmap bitmap = decodedBitmap;

            int mWidth = bitmap.getWidth();
            int mHeight = bitmap.getHeight();
            bitmap=resizeImage(bitmap, mWidth, 800);
//            bitmap = resizeImage(bitmap, 48 * 8, mHeight);


//            byte[]  bt =getBitmapData(bitmap);
//            byte[] dithered = thresholdToBWPic(toGrayscale(decodedBitmap));
//            byte[] data = eachLinePixToCmd(dithered, 16, 0);

//            bitmap.recycle();

            byte[] CutPaper = {0x1B, 0x69};
            try {
                byte ESC = 0x1B;
                byte NL = 0x0A;
                byte[] ESC_Init = new byte[]{ESC, '@'};
                byte[] LF = new byte[]{NL};
                char ESC_CHAR = 0x1B;
                char GS = 0x1D;
                byte[] LINE_FEED = new byte[]{0x0A};
                byte[] CUT_PAPER = new byte[]{(byte) GS, 0x56, 0x00};
                byte[] INIT_PRINTER = new byte[]{(byte) ESC_CHAR, 0x40};
                byte[] SELECT_BIT_IMAGE_MODE = {0x1B, 0x2A, 33};
                byte[] SET_LINE_SPACE_24 = new byte[]{(byte) ESC_CHAR, 0x33, 24};
//                mmOutputStream.write(ESC_Init);
//                mmOutputStream.write(LF);
//                mmOutputStream.write(SET_LINE_SPACE_24);
                mmOutputStream.write(Utils.decodeBitmap(decodedBitmap));
                mmOutputStream.write(String.valueOf("\n\n\n\n\n").getBytes());
                mmOutputStream.write(0x1D);
                mmOutputStream.write(86);
                mmOutputStream.write(48);
                mmOutputStream.write(0);
                if (call != null) {
                    call.success(new JSObject().put("response", "print successfully"));
                }
            } catch (IOException e) {
                e.printStackTrace();
                if (call != null) {
                    call.reject("Something went wrong");
                }
            }


        } catch (Exception e) {
            String errMsg = e.getMessage();
            Log.e(TAG, errMsg);
            e.printStackTrace();
//            callbackContext.error(errMsg);
        }
        return false;
    }


    private static Bitmap resizeImage(Bitmap bitmap, int w, int h) {
        Bitmap BitmapOrg = bitmap;
        int width = BitmapOrg.getWidth();
        int height = BitmapOrg.getHeight();

        if (width > w) {
            float scaleWidth = ((float) w) / width;
            float scaleHeight = ((float) h) / height + 24;
            Matrix matrix = new Matrix();
            matrix.postScale(scaleWidth, scaleWidth);
            Bitmap resizedBitmap = Bitmap.createBitmap(BitmapOrg, 0, 0, width,
                    height, matrix, true);
            return resizedBitmap;
        } else {
            Bitmap resizedBitmap = Bitmap.createBitmap(w, height + 24, Bitmap.Config.RGB_565);
            Canvas canvas = new Canvas(resizedBitmap);
            Paint paint = new Paint();
            canvas.drawColor(Color.WHITE);
            canvas.drawBitmap(bitmap, (w - width) / 2, 0, paint);
            return resizedBitmap;
        }
    }

    public static Bitmap toGrayscale(Bitmap bmpOriginal) {
        int width, height;
        height = bmpOriginal.getHeight();
        width = bmpOriginal.getWidth();

        Bitmap bmpGrayscale = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
        Canvas c = new Canvas(bmpGrayscale);
        Paint paint = new Paint();
        ColorMatrix cm = new ColorMatrix();
        cm.setSaturation(0);
        ColorMatrixColorFilter f = new ColorMatrixColorFilter(cm);
        paint.setColorFilter(f);
        c.drawBitmap(bmpOriginal, 0, 0, paint);
        return bmpGrayscale;
    }

    public static byte[] thresholdToBWPic(Bitmap mBitmap) {
        int[] pixels = new int[mBitmap.getWidth() * mBitmap.getHeight()];
        byte[] data = new byte[mBitmap.getWidth() * mBitmap.getHeight()];
        mBitmap.getPixels(pixels, 0, mBitmap.getWidth(), 0, 0, mBitmap.getWidth(), mBitmap.getHeight());
        format_K_threshold(pixels, mBitmap.getWidth(), mBitmap.getHeight(), data);
        return data;
    }

    private static void format_K_threshold(int[] orgpixels, int xsize, int ysize, byte[] despixels) {
        int graytotal = 0;
        boolean grayave = true;
        int k = 0;

        int i;
        int j;
        int gray;
        for (i = 0; i < ysize; ++i) {
            for (j = 0; j < xsize; ++j) {
                gray = orgpixels[k] & 255;
                graytotal += gray;
                ++k;
            }
        }

        int var10 = graytotal / ysize / xsize;
        k = 0;

        for (i = 0; i < ysize; ++i) {
            for (j = 0; j < xsize; ++j) {
                gray = orgpixels[k] & 255;
                if (gray > var10) {
                    despixels[k] = 0;
                } else {
                    despixels[k] = 1;
                }

                ++k;
            }
        }

    }

    public static byte[] eachLinePixToCmd(byte[] src, int nWidth, int nMode) {
        int[] p0 = new int[]{0, 128};
        int[] p1 = new int[]{0, 64};
        int[] p2 = new int[]{0, 32};
        int[] p3 = new int[]{0, 16};
        int[] p4 = new int[]{0, 8};
        int[] p5 = new int[]{0, 4};
        int[] p6 = new int[]{0, 2};
        int[][] Floyd16x16 = new int[][]{{0, 128, 32, 160, 8, 136, 40, 168, 2, 130, 34, 162, 10, 138, 42, 170}, {192, 64, 224, 96, 200, 72, 232, 104, 194, 66, 226, 98, 202, 74, 234, 106}, {48, 176, 16, 144, 56, 184, 24, 152, 50, 178, 18, 146, 58, 186, 26, 154}, {240, 112, 208, 80, 248, 120, 216, 88, 242, 114, 210, 82, 250, 122, 218, 90}, {12, 140, 44, 172, 4, 132, 36, 164, 14, 142, 46, 174, 6, 134, 38, 166}, {204, 76, 236, 108, 196, 68, 228, 100, 206, 78, 238, 110, 198, 70, 230, 102}, {60, 188, 28, 156, 52, 180, 20, 148, 62, 190, 30, 158, 54, 182, 22, 150}, {252, 124, 220, 92, 244, 116, 212, 84, 254, 126, 222, 94, 246, 118, 214, 86}, {3, 131, 35, 163, 11, 139, 43, 171, 1, 129, 33, 161, 9, 137, 41, 169}, {195, 67, 227, 99, 203, 75, 235, 107, 193, 65, 225, 97, 201, 73, 233, 105}, {51, 179, 19, 147, 59, 187, 27, 155, 49, 177, 17, 145, 57, 185, 25, 153}, {243, 115, 211, 83, 251, 123, 219, 91, 241, 113, 209, 81, 249, 121, 217, 89}, {15, 143, 47, 175, 7, 135, 39, 167, 13, 141, 45, 173, 5, 133, 37, 165}, {207, 79, 239, 111, 199, 71, 231, 103, 205, 77, 237, 109, 197, 69, 229, 101}, {63, 191, 31, 159, 55, 183, 23, 151, 61, 189, 29, 157, 53, 181, 21, 149}, {254, 127, 223, 95, 247, 119, 215, 87, 253, 125, 221, 93, 245, 117, 213, 85}};


        int nHeight = src.length / nWidth;
        int nBytesPerLine = nWidth / 8;
        byte[] data = new byte[nHeight * (8 + nBytesPerLine)];
        boolean offset = false;
        int k = 0;

        for (int i = 0; i < nHeight; ++i) {
            int var10 = i * (8 + nBytesPerLine);
            //GS v 0 m xL xH yL yH d1....dk 打印光栅位图
            data[var10 + 0] = 29;//GS
            data[var10 + 1] = 118;//v
            data[var10 + 2] = 48;//0
            data[var10 + 3] = (byte) (nMode & 1);
            data[var10 + 4] = (byte) (nBytesPerLine % 256);//xL
            data[var10 + 5] = (byte) (nBytesPerLine / 256);//xH
            data[var10 + 6] = 1;//yL
            data[var10 + 7] = 0;//yH

            for (int j = 0; j < nBytesPerLine; ++j) {
                data[var10 + 8 + j] = (byte) (p0[src[k]] + p1[src[k + 1]] + p2[src[k + 2]] + p3[src[k + 3]] + p4[src[k + 4]] + p5[src[k + 5]] + p6[src[k + 6]] + src[k + 7]);
                k += 8;
            }
        }

        return data;
    }


}
