import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ParamMapInterface } from 'src/app/models/users';

@Component({
  selector: 'app-param-map',
  templateUrl: './param-map.component.html',
  styleUrls: ['./param-map.component.scss'],
})
export class ParamMapComponent implements OnInit {
  public paramMapForm: FormGroup;

  constructor(private readonly dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) private readonly data: any, private fb: FormBuilder) {
    this.paramMapForm = this.fb.group({
      size_h1: [this.data.paramMap?.size_h1 || 2],
      size_h1_mobile: [this.data.paramMap?.size_h1_mobile || 2],
      size_poste: [this.data.paramMap?.size_poste || 5],
      size_poste_mobile: [this.data.paramMap?.size_poste_mobile || 2],
    });
    if (!this.data.paramMap) this.data.paramMap = this.paramMapForm.value;
  }

  ngOnInit() {
    this.paramMapForm.valueChanges.subscribe((values) => {
      this.updateCSSVariable(values);
    });
  }

  updateCSSVariable(values: ParamMapInterface): void {
    document.documentElement.style.setProperty('--dynamic-size-h1', `${values.size_h1}rem`);
    document.documentElement.style.setProperty('--dynamic-size-h1-mobile', `${values.size_h1_mobile}rem`);
    document.documentElement.style.setProperty('--dynamic-size-poste', `${values.size_poste}rem`);
    document.documentElement.style.setProperty('--dynamic-size-poste-mobile', `${values.size_poste_mobile}rem`);
  }

  public submit() {
    this.dialogRef.close({ validate: true, paramReturn: this.paramMapForm.value });
  }

  public cancel() {
    document.documentElement.style.setProperty('--dynamic-size-h1', `${this.data.paramMap?.size_h1}rem`);
    document.documentElement.style.setProperty('--dynamic-size-h1-mobile', `${this.data.paramMap?.size_h1_mobile}rem`);
    document.documentElement.style.setProperty('--dynamic-size-poste', `${this.data.paramMap?.size_poste}rem`);
    document.documentElement.style.setProperty('--dynamic-size-poste-mobile', `${this.data.paramMap?.size_poste_mobile}rem`);

    this.dialogRef.close({ validate: false });
  }
}
