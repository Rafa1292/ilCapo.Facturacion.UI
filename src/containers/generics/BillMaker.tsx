import React, { useEffect, useState } from 'react'
import '../../scss/billMaker.scss'
import { SaleItemCategory } from '../../types/saleItemCategory'
import { useGetList, useGet } from '../../hooks/useAPI'
import { ProductModifier } from '../../types/productModifier'
import BillMakerItems from '../../components/billMaker/BillMakerItems'
import useBill from '../../hooks/useBill'
import BillResume from '../../components/BillResume'

interface Props {
  tableNumber: number
}

const BillMaker = ({ tableNumber }: Props) => {
  const [saleItemCategories, setSaleItemCategories] = useState<SaleItemCategory[]>([])
  const [saleItemCategory, setSaleItemCategory] = useState<SaleItemCategory>()
  const { bill, addBillItem, printBill } = useBill()

  const setCategory = (saleItemCategory: SaleItemCategory) => {
    setSaleItemCategory(saleItemCategory)
  }

  useEffect(() => {
    const getSaleItemCategories = async () => {
      const response = await useGetList<SaleItemCategory[]>('saleItemCategories', false)
      if (!response.error) {
        const tmpSaleItemCategories = response.data
        for (const saleItemCategory of tmpSaleItemCategories) {
          for (const saleItem of saleItemCategory.saleItems) {
            for (const saleItemProduct of saleItem.saleItemProducts) {
              const productModifiersResponse = await useGet<ProductModifier[]>(`productModifiers/byProductId/${saleItemProduct.productId}`, false)
              if (!productModifiersResponse.error) {
                const productModifiers = productModifiersResponse.data
                saleItemProduct.product.productModifiers = productModifiers
              }
            }
          }
        }
        setSaleItemCategories(tmpSaleItemCategories)
      }
    }
    getSaleItemCategories()
  }, [saleItemCategory])

  return (
    <div className='col-12 d-flex flex-wrap'>
      <div className="col-8 bill-maker" >
        <div className="col-8 d-flex flex-wrap justify-content-around position-absolute bg-dark p-2 shadow"
          style={{ borderBottom: '1px solid rgba(255,193,7,0.8)', top: '0' }}>
          {
            saleItemCategories.map((tmpSaleItemCategory, index) => {
              return (
                <div key={index} onClick={() => setCategory(tmpSaleItemCategory)} className="px-3 py-1 rounded pointer item-category" >
                  <h6 className='m-0'>{tmpSaleItemCategory.name}</h6>
                </div>
              )
            })
          }
        </div>
        {
          saleItemCategory &&
          <BillMakerItems addBillItem={addBillItem} saleItemCategory={saleItemCategory} />
        }
      </div>
      <div className="col-4 shadow" style={{ height: '100vh' }}>
        <button className="btn btn-warning" onClick={() => printBill()}>Print</button>
        <BillResume bill={bill}/>
      </div>
    </div>
  )
}

export default BillMaker