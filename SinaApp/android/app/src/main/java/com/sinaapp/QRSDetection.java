package com.sinaapp;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

import java.util.ArrayList;

public class QRSDetection extends ReactContextBaseJavaModule {

    public static final int M = 5;

    public QRSDetection(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "QRSDetection";
    }

    @ReactMethod
    public void getHeartRate(ReadableArray data_list, int frameECG, Callback cb){

        try{
            ArrayList dataSample = data_list.toArrayList();
            int nsamp = dataSample.size() - 2;
            float[] sig0 = new float[nsamp];
            for (int i = 2; i < nsamp; i++) {
                sig0[i - 2] = Float.parseFloat(String.valueOf(dataSample.get(i)));
            }

            float[] highPass = highPass(sig0, nsamp);

            float[] lowPass = lowPass(highPass, nsamp);

            int[] QRS = QRS(lowPass, nsamp,frameECG);

            int HeartRate=0;

            for (int i = 0; i < QRS.length; i++) {
                HeartRate= HeartRate + QRS[i];
            }
            cb.invoke(null,HeartRate);
        }catch (Exception e){
            cb.invoke(e,null);
        }
    }

    // ===============High Pass Filter================================
    // M是Window size， 5 or 7是較好的選擇（取奇數）
    // y1:前M個值(包括自己)加總除以M
    // y2:Group delay (M+1/2)

    public static float[] highPass(float[] sig0, int nsamp) { // nsamp: data數量
        float[] highPass = new float[nsamp];
        float constant = (float) 1 / M;

        for (int i = 0; i < sig0.length; i++) { // sig0: input data的array
            float y1 = 0;
            float y2 = 0;

            int y2_index = i - ((M + 1) / 2);
            if (y2_index < 0) { // 若小於0則array最後開始往回推
                y2_index = nsamp + y2_index;
            }
            y2 = sig0[y2_index];

            float y1_sum = 0;
            for (int j = i; j > i - M; j--) {
                int x_index = i - (i - j);
                if (x_index < 0) {
                    x_index = nsamp + x_index;
                }
                y1_sum += sig0[x_index];
            }

            y1 = constant * y1_sum; // constant = 1/M
            highPass[i] = y2 - y1;
        }

        return highPass;
    }

    // ============Low pass filter==================
    // Non Linear
    // 平方->加總
    public static float[] lowPass(float[] sig0, int nsamp) {
        float[] lowPass = new float[nsamp];
        for (int i = 0; i < sig0.length; i++) {
            float sum = 0;
            if (i + 30 < sig0.length) {
                for (int j = i; j < i + 30; j++) {
                    float current = sig0[j] * sig0[j]; // 算平方
                    sum += current; // 加總
                }
            } else if (i + 30 >= sig0.length) { // 超過array
                int over = i + 30 - sig0.length;
                for (int j = i; j < sig0.length; j++) {
                    float current = sig0[j] * sig0[j];
                    sum += current;
                }
                // 怪怪的?? over應該<0
                for (int j = 0; j < over; j++) {
                    float current = sig0[j] * sig0[j];
                    sum += current;
                }
            }

            lowPass[i] = sum;
        }

        return lowPass;

    }

    // =================QRS Detection================
    // beat seeker
    // alpha: forgetting factor 從0.001到0.1之間隨機取值
    // Garma: weighting factor 從0.15和0.2之間選一個

    public static int[] QRS(float[] lowPass, int nsamp, int frameECG) {
        int[] QRS = new int[nsamp];

        double treshold = 2000000;

        // 先從所有值中找出最大值當Threshold
        for (int i = 0; i < lowPass.length; i++) {
            if (lowPass[i] > 0 && lowPass[i] < treshold) {
                treshold = lowPass[i];
            }
        }

        int frame = frameECG; // window size 取前250個中最大的值當PEAK

        for (int i = 0; i < lowPass.length; i += frame) { // 每250筆data算一次
            float min = 20000000;
            int index = 0;
            if (i + frame > lowPass.length) { // 如果超過則為最後一個
                index = lowPass.length;
            } else {
                index = i + frame;
            }
            for (int j = i; j < index; j++) {
                if (lowPass[j] > 0 && lowPass[j] < min)
                    min = lowPass[j]; // 250個data中的最大值
            }
            boolean added = false;
            for (int j = i; j < index; j++) {
                if (lowPass[j] > treshold && !added) {
                    QRS[j] = 1; // 找到R點，250個裡面就不再繼續找 (約0.5秒)
                    // 若之後改成real time則frame可以改為1
                    added = true;
                } else {
                    QRS[j] = 0;
                }
            }
            double gama = (Math.random() > 0.5) ? 0.15 : 0.20;
            double alpha = 0.01 + (Math.random() * ((0.1 - 0.01)));

            treshold = alpha * gama * min + (1 - alpha) * treshold;
        }

        return QRS;
    }

}
